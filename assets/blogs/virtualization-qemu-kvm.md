# Virtualization — QEMU-KVM

I recently had to set up a network of VMs for my Information and Network Security class. I decided to go with a QEMU/KVM setup instead of the usual VirtualBox/VMware route. Reason? I enjoy the feeling I get when I am tinkering with something. A VirtualBox/VMware setup would have been reliable and straightforward, but I was chasing the **“I did something”** emotion. That is also the same reason I started using Neovim for coding; it has a dexterous feel to it.

Before we start, this paragraph is a quick introduction to QEMU and KVM.

**KVM** stands for **Kernel-based Virtual Machine**. It is a Linux kernel subsystem that allows Linux to use hardware virtualization extensions provided by the CPU. On an Intel machine, this is generally VT-x; on AMD it is AMD-V. As all things in linux KVM too is exposed through a file. It is similar to a device node, and is exposed via `/dev/kvm`.

**QEMU** is the machine emulator/virtualizer. It provides the virtual hardware: disks, network cards, display devices, firmware, PCI devices, USB controllers, and so on.

**KVM** provides the kernel-level acceleration that lets QEMU execute guest CPU instructions using the host CPU’s virtualization capabilities rather than emulating every instruction in software.

So, very roughly:

![[virtualization.png]]

`QEMU/KVM` is what enables virtualization on linux. Then, there is **libvirt**. It is like a management layer and API for virtualization technologies such as QEMU/KVM. It manages things such as:

- VM definitions
- CPU and memory configuration
- virtual disks
- networking
- storage pools
- firmware
- snapshots
- VM lifecycle
- devices

`virsh` is the command-line interface to libvirt. `virt-manager` is the graphical management interface. It talks to `libvirt`.

There is also GNOME Boxes, which is another graphical frontend for QEMU/KVM/libvirt. Boxes is meant to make virtualization simpler and hide a lot of the underlying configuration. `virt-manager` exposes much more of the actual virtual hardware and libvirt configuration.

Since my goal wasn’t just to get a VM running but to understand what was happening, I went with `virt-manager` and `virsh`.

This is the stack:

```
                 virt-manager
                      │
                    virsh
                      │
                      ▼
                   libvirt
                      │
                      ▼
                  QEMU / KVM
                      │
             ┌────────┴────────┐
             │                 │
         virtual CPU      virtual devices
             │                 │
             └────────┬────────┘
                      ▼
                   Guest OS
```

---

# Before anything else: does KVM actually work?

Before building anything, I ran a sanity check:

```bash
virt-host-validate
```

This walks through the host’s virtualization capabilities and flags anything that is missing.

This is useful because it can catch problems such as hardware virtualization not being available or required virtualization components not being configured properly.

It is much better to discover that here than to discover it three VMs deep when `virt-install` throws some cryptic KVM error.

I could also check that the KVM device actually exists:

```bash
ls -l /dev/kvm
```

This is the point where the `/dev/kvm` explanation from earlier becomes useful. KVM is part of the kernel, but userspace virtualization software interacts with it through this device interface.

---

# The first quirk: `qemu:///session` vs `qemu:///system`

I had to do sudo to make VMs since some of the operations like networking needed elevated privileges. So I started looking into ways to avoid having to use sudo again and again.

Turns out libvirt has something called the **connection scopes**. There was the session scope which was associated to **my user session** (`qemu:///session`). Then there was the **system-wide libvirt daemon**, connecting to the system scope (`qemu:///system`).

This is the usual choice when creating infrastructure-like VMs, because resources such as:

- system networks
- system storage pools
- shared VM definitions

are managed centrally.

This also explained the situation where:

```bash
virsh net-list --all
```

showed nothing, while:

```bash
sudo virsh net-list --all
```

showed the default network:

```
Name      State   Autostart   Persistent
--------------------------------------------
default   active  yes         yes
```

To put it simply I was looking at two different libvirt worlds.

The important thing here is that `qemu:///session` and `qemu:///system` aren’t two different versions of QEMU. They are two different libvirt connection scopes.

So, in order to work with the system-wide VMs and networks, I decided to use:

```
qemu:///system
```

This can be done with the flag:

```bash
--connect qemu:///system
```

For persistence, you can set the following environment variable by updating your `.zshrc` or `.bashrc` files:

```bash
export LIBVIRT_DEFAULT_URI="qemu:///system"
```

Then, after refreshing the terminal session, the scope can be checked with:

```bash
virsh uri
```

which should return:

```
qemu:///system
```

There is another part to this though: the user still needs permission to access the system libvirt service. On my Fedora setup, I was already a member of the relevant groups:

```bash
groups
```

which included:

```
kvm
libvirt
```

This is why I could eventually work with `qemu:///system` without having to put `sudo` in front of every command.

---

# Building the lab network

The whole point of this exercise was networking.

But before actually creating the VMs, I needed somewhere to put them.

The important thing here is that I ended up with **two completely separate networks**, because they serve two completely different purposes.

The first is `labnet`. This is the network for my **Information and Network Security class**.

The second is libvirt’s `default` network. This is what I use for my standalone **ParrotOS HTB machine**.

These are intentionally separate.

The INS lab looks roughly like:

```
                         Fedora Host
                              │
                           labnet
                     192.168.100.0/24
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           Windows       Metasploitable      Kali
            target          target         Distrobox
```

While Parrot is completely separate:

```
                  Fedora Host
                       │
                    default
                       │
                    Internet
                       │
                    ParrotOS
                       │
                    HTB VPN
```

Parrot is not part of `labnet`.

`labnet` is for my INS class. Parrot is a standalone machine for HTB.

---

# Why `labnet` exists

This wasn’t just tidiness.

Metasploitable is deliberately full of vulnerable and unpatched services. I did not want to put a deliberately exploitable machine directly onto the physical network at NFSU.

If I had bridged Metasploitable directly onto my physical NIC, I could potentially have exposed its vulnerable services to other machines on the university network.

Instead, I created a private libvirt network.

The lab machines can communicate with each other, and the Fedora host can communicate with the lab, without putting the vulnerable machines directly onto the university LAN.

The network is:

```
labnet
192.168.100.0/24
```

with the libvirt host-side gateway at:

```
192.168.100.1
```

The network is described using a libvirt XML definition.

I used something along these lines:

```xml
<network>
  <name>labnet</name>

  <forward mode="nat"/>

  <bridge name="labnet_lab" stp="on" delay="0"/>

  <ip address="192.168.100.1" netmask="255.255.255.0">
    <dhcp>
      <range start="192.168.100.10" end="192.168.100.100"/>
    </dhcp>
  </ip>
</network>
```

I saved this as:

```
labnet.xml
```

There are a few important things happening here.

```xml
<name>labnet</name>
```

gives the libvirt network its name.

```xml
<bridge name="labnet_lab"/>
```

tells libvirt to create a virtual bridge with that name.

```xml
<ip address="192.168.100.1" ...>
```

sets the address of the host-side interface on this virtual network.

And:

```xml
<dhcp>
    <range start="192.168.100.10" end="192.168.100.100"/>
</dhcp>
```

provides DHCP addresses to the VMs.

The:

```xml
<forward mode="nat"/>
```

means that traffic leaving the virtual network can be NATed through the Fedora host.

So the topology is approximately:

```
                Physical Network
                       │
                   Fedora Host
                       │
                 ┌─────┴─────┐
                 │           │
              Internet    labnet
                           │
                    192.168.100.1
                           │
              ┌────────────┼────────────┐
              │            │            │
           Windows    Metasploitable   Kali
```

The important security property here is that `labnet` is **not simply a bridge to my physical Ethernet/Wi-Fi network**.

---

# Creating the network

Once I had the XML file, I defined the network:

```bash
virsh net-define labnet.xml
```

Then started it:

```bash
virsh net-start labnet
```

And made it start automatically:

```bash
virsh net-autostart labnet
```

I could check it with:

```bash
virsh net-list --all
```

which should show something along the lines of:

```
Name      State   Autostart   Persistent
--------------------------------------------
default   active  yes         yes
labnet    active  yes         yes
```

I can inspect the network with:

```bash
virsh net-info labnet
```

and see the actual XML libvirt is using with:

```bash
virsh net-dumpxml labnet
```

I can also see the bridge from Fedora:

```bash
ip link show labnet_lab
```

or:

```bash
ip addr show labnet_lab
```

This was particularly useful because I could finally see that the “network” wasn’t some abstract thing inside libvirt. There was an actual bridge interface on my Fedora host.

One thing I ran into here was:

```
error: Failed to start network labnet
error: error creating bridge interface labnet_lab:
Operation not permitted
```

This was another consequence of me mixing the session and system libvirt scopes. I was trying to start a system-level network from the wrong libvirt connection.

Once I consistently used:

```
qemu:///system
```

the network was being managed by the same libvirt instance as my VMs.

If I ever want to shut the network down:

```bash
virsh net-destroy labnet
```

and if I want to remove the persistent network definition entirely:

```bash
virsh net-undefine labnet
```

---

# Connecting the machines to `labnet`

Once the network exists, attaching a VM to it is surprisingly simple.

For example, my Windows VM has:

```bash
--network network=labnet,model=virtio
```

and Metasploitable has the same:

```bash
--network network=labnet,model=virtio
```

This tells libvirt:

> Give this VM a virtual network interface and connect it to the existing `labnet` network.
> 

The Fedora host itself also has an interface on that bridge, which means I can communicate with the lab from the host.

I also use Kali through **Distrobox** on Fedora. It is not another VM in this setup. Since it is running as a containerized userspace environment on the Fedora host, it can use the host’s networking and therefore participate in the lab from the host side.

This gives me the INS lab topology I actually wanted:

```
                     Fedora Host
                           │
                     labnet_lab
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Windows        Metasploitable       Kali
        target           target          Distrobox
```

This is my **INS class network**.

---

# Creating the Metasploitable VM

For my first target, I had a Metasploitable QCOW2 image.

Initially I kept the image in:

```
~/VMs/libvirt/metasploitable.qcow2
```

and tried `virt-install`.

I got:

```
Cannot access storage file
'/home/adper/VMs/libvert/metasploitable.qcow2'
(as uid:107, gid:107): Permission denied
```

The fact that I could read the file did not mean the QEMU process could.

The system libvirt QEMU process runs under a restricted account, in this case the `qemu` user. It also needs permission to traverse the directories leading to the file.

So, ideally, we are supposed to put the VM storage at:

```
/var/lib/libvirt/images/
```

I copied the disk there:

```bash
sudo cp ~/VMs/libvirt/metasploitable.qcow2 \
    /var/lib/libvirt/images/metasploitable.qcow2
```

On Fedora, SELinux can also matter when moving files into locations used by virtualization, so it is useful to make sure the file has the expected SELinux context:

```bash
sudo restorecon -v /var/lib/libvirt/images/metasploitable.qcow2
```

I then created the VM with:

```bash
virt-install \
  --connect qemu:///system \
  --name metasploitable \
  --memory 512 \
  --vcpus 1 \
  --disk path=/var/lib/libvirt/images/metasploitable.qcow2,bus=virtio \
  --network network=labnet,model=virtio \
  --import \
  --os-variant ubuntu16.04 \
  --graphics spice \
  --noautoconsole
```

The important thing here is:

```
--import
```

because I already had an operating system disk. I wasn’t asking `virt-install` to install an OS from an ISO. I was asking it to build a libvirt VM around an existing disk image.

The VM can then be started with:

```bash
virsh start metasploitable
```

and its graphical display can be opened with:

```bash
virt-viewer --connect qemu:///system metasploitable
```

Although in a security lab, I don’t necessarily need to “enter” Metasploitable at all.

The interesting architecture is:

```
                  labnet
                     │
          ┌──────────┴──────────┐
          │                     │
       Kali                 Metasploitable
     Distrobox                  target
          │                     │
          └─────── attacks ─────┘
```

**This is Kali attacking Metasploitable, not Parrot.**

Kali is running through Distrobox on my Fedora host and is participating in the INS `labnet`.

I can interact with Metasploitable from Kali over the lab network using things such as:

```
nmap
ssh
ftp
http
smb
...
```

depending on what services are exposed.

This is the point of having a vulnerable target inside a private lab.

---

# Creating the Windows VM

Similarly, I also setup a Windows VM with this `virt-install` command:

```bash
virt-install \
  --connect qemu:///system \
  --name windows-lab \
  --memory 4096 \
  --vcpus 4 \
  --disk path=/var/lib/libvirt/images/windows-lab.qcow2,size=60,bus=virtio,format=qcow2 \
  --cdrom /var/lib/libvirt/boot/windows11.iso \
  --disk /usr/share/virtio-win/virtio-win.iso,device=cdrom \
  --network network=labnet,model=virtio \
  --graphics spice \
  --video qxl \
  --os-variant win11 \
  --boot uefi \
  --tpm backend.type=emulator,backend.version=2.0
```

`virt-install` is basically telling libvirt:

> Create a VM with these characteristics.
> 

The important pieces are:

```
--memory 4096
```

4 GB RAM.

```
--vcpus 4
```

4 virtual CPUs.

```
--disk ... size=60
```

A 60 GB virtual disk.

```
--network network=labnet
```

Connect the VM to my INS lab network.

```
--graphics spice
```

Use SPICE for the graphical console.

```
--boot uefi
```

Use UEFI firmware.

```
--tpm backend.type=emulator,backend.version=2.0
```

Provide a virtual TPM 2.0 device.

And:

```
--cdrom /var/lib/libvirt/boot/windows11.iso
```

makes the Windows ISO the installation media.

I downloaded the Windows ISO directly from Microsoft’s website and used the unactivated installation for the lab. Since this wasn’t going to be my daily Windows machine, I didn’t particularly care about activation or the watermark.

---

# The Third quirk: VirtIO

Windows setup booted successfully.

Then I reached the disk selection screen, there was no disk.

The VM had a 60GB virtual disk. QEMU had created it. The disk existed but Windows couldn’t see it.

Why?

Because I had explicitly said:

```
bus=virtio
```

in the `virt-install` command.

VirtIO is a paravirtualized device interface designed to provide efficient virtual I/O. Instead of pretending to be some old physical disk controller, QEMU exposes a VirtIO device and the guest uses a VirtIO driver to communicate with it.

Linux generally has excellent VirtIO support.

Windows, however, didn’t have the storage driver available during installation.

Luckily I had also attached:

```
/usr/share/virtio-win/virtio-win.iso
```

as a second virtual CD-ROM.

From the Windows installer I selected **Load Driver**, browsed to the VirtIO CD, and loaded the storage driver.

After that, the 60 GB virtual disk appeared.

The important part here is that the disk wasn’t missing.

It was simply being presented through a virtual controller for which Windows didn’t yet have a driver.

So:

```
                     Fedora
                        │
                /var/lib/libvirt/
                   images/
                        │
                        ▼
              windows-lab.qcow2
                        │
                        ▼
                      QEMU
                        │
                   VirtIO disk
                        │
                        ▼
                     Windows
                        │
                VirtIO driver
                        │
                        ▼
                  Windows disk
```

The same thing happened with networking.

The VM had a VirtIO network interface:

```
--network network=labnet,model=virtio
```

but Windows needed the VirtIO network driver before it could use that interface.

This was a good reminder that virtual hardware is still hardware from the guest’s perspective.

The device doesn’t physically exist, but the operating system still needs to know how to communicate with it.

---

# UEFI is also virtualized

When booting the VM as well we get the screen from UEFI with `Please select boot device`.

This is the guest’s virtual firmware.

The VM is essentially being presented with an entire virtual computer as:

```
Host OS
  │
  └── QEMU
       │
       ├── virtual CPU
       ├── virtual RAM
       ├── virtual disk
       ├── virtual NIC
       └── virtual UEFI
             │
             └── virtual hardware
```

This is one of those things that is easy to forget when using a GUI VM application.

The VM isn’t just “a program running Windows”.

QEMU is presenting Windows with a computer.

---

# Secure Boot and OVMF

I also wanted to setup a Parrot VM to perform practical tasks from HackTheBox. It was a procedure similar to what was described above.

**This VM is separate from my INS lab.**

I did not put Parrot on `labnet`.

Instead, Parrot uses libvirt’s `default` network so that it can have normal outbound Internet connectivity and be used as my standalone HTB machine.

The Parrot HTB edition was available to me as an ISO, so unlike downloading a ready-made QCOW2 image, I had to create the QCOW2 disk myself and install Parrot into it.

I used:

```
4 GB RAM
4 vCPUs
60 GB QCOW2
VirtIO disk
VirtIO network
UEFI
```

The VM was created with:

```bash
virt-install \
  --connect qemu:///system \
  --name parrot-htb \
  --memory 4096 \
  --vcpus 4 \
  --disk path=/var/lib/libvirt/images/parrot-htb.qcow2,size=60,bus=virtio,format=qcow2 \
  --cdrom /var/lib/libvirt/boot/parrot-htb.iso \
  --network network=default,model=virtio \
  --graphics spice \
  --os-variant debian13 \
  --boot firmware=efi,firmware.feature0.name=secure-boot,firmware.feature0.enabled=no
```

I initially had a Secure Boot problem.

When the VM booted, there was a blue UEFI error:

```
Verification failed: (0x1A) Security Violation
```

This wasn’t KVM rejecting Parrot.

It wasn’t QEMU rejecting Parrot.

The virtual UEFI firmware was rejecting the bootloader because Secure Boot was enabled.

The firmware being used by QEMU in this setup is OVMF, which provides UEFI firmware for virtual machines.

I inspected the host’s capabilities with:

```bash
virsh domcapabilities
```

and found:

```xml
<loader supported='yes'>
    ...
    <enum name='secure'>
        <value>no</value>
    </enum>
</loader>
```

My host supported UEFI with Secure Boot disabled.

I checked the supported boot sub-options with:

```bash
virt-install '--boot=?'
```

which showed:

```
firmware
firmware.feature[0-9]*.enabled
firmware.feature[0-9]*.name
loader.secure
...
```

So instead of blindly specifying a firmware binary, I could explicitly configure the firmware feature.

I wanted:

```
UEFI:        ON
Secure Boot: OFF
```

and the relevant part of the command was:

```
--boot firmware=efi,firmware.feature0.name=secure-boot,firmware.feature0.enabled=no
```

This was another useful lesson: UEFI and Secure Boot are not the same thing.

I wanted UEFI, just without Secure Boot enforcement.

---

# Installing Parrot

Once the firmware configuration was correct, Parrot booted into its installer.

The installer detected:

```
vda - 60.00 GiB (/dev/vda)
```

This was my virtual disk.

The `/dev/vda` name is again related to VirtIO.

The actual chain is:

```
Fedora
  │
  └── parrot-htb.qcow2
         │
         ▼
       QEMU
         │
         ▼
      VirtIO disk
         │
         ▼
      /dev/vda
         │
         ▼
       Parrot
```

I chose **Erase disk** because this was a brand-new virtual 60GB disk.

This does not erase my Fedora disk.

It formats the virtual disk that QEMU presented to Parrot.

So the actual storage relationship is:

```
Physical SSD
└── Fedora filesystem
    └── /var/lib/libvirt/images/
        └── parrot-htb.qcow2
              │
              ▼
             QEMU
              │
              ▼
           /dev/vda
              │
              ├── EFI partition
              └── Parrot filesystem
```

This is probably one of the most important mental models to have when working with VMs.

---

# Parrot and the `default` network

Unlike the INS machines, Parrot is attached to libvirt’s `default` network:

```bash
--network network=default,model=virtio
```

This is intentional.

Parrot is not part of my university lab.

It is a standalone machine that I use for Hack The Box, so I want it to have normal outbound connectivity.

The topology is:

```
                  Fedora Host
                       │
                    default
                       │
                    Internet
                       │
                    ParrotOS
                       │
                    HTB VPN
                       │
                   Hack The Box
```

The `default` network is separate from:

```
labnet
```

which is my INS class network.

This separation also means that accidentally attacking something from my HTB Parrot VM does not mean I am accidentally attacking the machines in my university lab network.

---

# Creating Snapshots

This was one of the main reasons I wanted a VM in the first place.

HTB encourages having a disposable machine because you’re going to install things, modify configurations, break packages, change network settings, and generally do things that aren’t necessarily good for a normal workstation.

Once I had Parrot installed and configured, I shut it down:

```bash
virsh shutdown parrot-htb
```

I checked that it had actually shut down:

```bash
virsh domstate parrot-htb
```

Once it reported:

```
shut off
```

I created the snapshot:

```bash
virsh snapshot-create-as \
    parrot-htb \
    clean-parrot-htb \
    "Clean Parrot HTB baseline"
```

where `parrot-htb` was my VM and `clean-parrot-htb` is my snapshot.

I could inspect it with:

```bash
virsh snapshot-list parrot-htb
```

and:

```bash
virsh snapshot-list parrot-htb --tree
```

Now I have a clean baseline that I can return to after destroying the machine with some experiment.

The workflow becomes:

```
                 clean-parrot-htb
                        │
                        ▼
                   Boot Parrot
                        │
                  Do HTB stuff
                        │
              ┌─────────┼─────────┐
              │         │         │
          install     modify    break
           tools      configs   packages
              │         │         │
              └─────────┼─────────┘
                        │
                       💥
                        │
                        ▼
                snapshot-revert
                        │
                        ▼
                 clean-parrot-htb
```

To revert:

```bash
virsh shutdown parrot-htb
virsh snapshot-revert parrot-htb clean-parrot-htb
virsh start parrot-htb
```

Snapshots are not backups though.

If the physical SSD dies, the VM and its snapshot data can disappear together.

Snapshots are rollback points, not a replacement for backups.

I also don’t want to create a snapshot every five minutes. I would rather have a clean baseline and a few meaningful checkpoints such as:

```
clean-parrot-htb
tools-configured
before-experiment
```

---

# Managing the VMs after creation

Once the VMs are created, I don’t need to run `virt-install` every time I want to use them.

`virt-install` is primarily for creating and installing the VM.

After that, the normal lifecycle is handled through `virsh`.

List VMs:

```bash
virsh list --all
```

Start a VM:

```bash
virsh start parrot-htb
```

Open its graphical console:

```bash
virt-viewer --connect qemu:///system parrot-htb
```

Gracefully shut it down:

```bash
virsh shutdown parrot-htb
```

Check its state:

```bash
virsh domstate parrot-htb
```

Forcefully power it off:

```bash
virsh destroy parrot-htb
```

Again, `destroy` sounds much more dramatic than it actually is.

It does not delete the VM.

It is basically the equivalent of pulling the power cable.

If I actually want to remove the libvirt domain definition:

```bash
virsh undefine parrot-htb
```

If it uses UEFI NVRAM, I may have to do:

```bash
virsh undefine parrot-htb --nvram
```

---

# The UEFI NVRAM surprise

When I first tried to remove my Parrot VM, I ran:

```bash
virsh undefine parrot-htb
```

and got:

```
Requested operation is not valid:
cannot undefine domain with nvram
```

This is because the UEFI VM had its own NVRAM / firmware variable store.

So the VM was more than:

```
domain definition
+
disk
```

It was also:

```
domain definition
+
QCOW2 disk
+
UEFI NVRAM
```

So the proper removal command was:

```bash
virsh undefine parrot-htb --nvram
```

Another reminder that a VM is more than a disk image.

---

# Storage pools

Libvirt also has the concept of **storage pools**.

I ran:

```bash
virsh pool-list --all
```

and saw pools such as:

```
images
libvert
libvert-1
```

A storage pool is basically a libvirt-managed source of storage from which volumes can be created and managed.

A virtual disk can therefore be thought of as:

```
storage pool
     │
     └── volume
            │
            └── QCOW2
```

This is another abstraction layer.

One confusing moment was trying:

```bash
virsh pool-info default
```

and getting:

```
Storage pool not found
```

That’s because `default` in my case was the **network**, not a storage pool.

Libvirt uses names such as `default` in multiple contexts, so this is something to keep in mind.

---

# Why QCOW2?

QCOW2 is QEMU’s Copy-On-Write disk image format.

Instead of immediately allocating the entire advertised capacity, the image can grow as data is written.

So a:

```
60GB QCOW2
```

doesn’t necessarily mean 60GB is consumed immediately.

It can start much smaller and grow towards its virtual capacity.

This also becomes interesting when snapshots are involved because copy-on-write allows the VM to maintain changed storage state relative to an earlier state.

Conceptually:

```
Base disk
   │
   ├── original blocks
   │
   └── changed blocks
          │
          ▼
       snapshot
```

For disposable security labs, this is very convenient.

---

# Vagrant: the next abstraction

Vagrant is essentially an environment automation layer for virtual machines.

Instead of manually running commands such as:

```bash
virt-install ...
virsh ...
virsh ...
virsh ...
```

you can describe an environment in a `Vagrantfile` and let Vagrant construct it.

The stack becomes:

```
                 Vagrant
                    │
                Vagrantfile
                    │
              Vagrant provider
                    │
                 libvirt
                    │
                QEMU / KVM
                    │
                    ▼
                   VM
```

Vagrant itself is not the hypervisor.

It doesn’t replace QEMU, KVM or libvirt.

It sits above them and automates the creation and configuration of machines.

This becomes particularly interesting for my lab because instead of manually creating every target, I can describe parts of the environment as code.

---

# Using Vagrant with `labnet`

This is where I think Vagrant can actually become useful for my setup.

The interesting use of Vagrant here is **the INS lab**, not my Parrot HTB VM.

Parrot already exists as a manually configured standalone VM on the `default` network. I don’t need Vagrant to manage it.

Instead, I can use Vagrant to reproduce machines that belong on my existing `labnet`.

The architecture becomes:

```
                  Vagrantfile
                       │
                       ▼
                    Vagrant
                       │
                 libvirt provider
                       │
                       ▼
                    libvirt
                       │
                     labnet
                       │
          ┌────────────┼────────────┐
          │            │            │
       VM target    VM target     etc.
```

Vagrant’s libvirt provider can attach a VM to an existing libvirt network using:

```ruby
libvirt__network_name: "labnet"
```

For example:

```ruby
Vagrant.configure("2") do |config|

  config.vm.define "lab-target" do |target|

    target.vm.box = "debian/bookworm64"

    target.vm.network "private_network",
      ip: "192.168.100.20",
      libvirt__network_name: "labnet"

    target.vm.provider :libvirt do |libvirt|
      libvirt.memory = 1024
      libvirt.cpus = 1
    end

  end

end
```

The important bit is:

```ruby
libvirt__network_name: "labnet"
```

That says:

> Don’t invent another network. Connect this VM to my existing libvirt `labnet`.
> 

Then:

```bash
vagrant up
```

can create the VM and connect it to the lab.

The interesting part is that the environment definition lives in the repository rather than only existing in my head.

For example:

```
INS-Lab/
├── Vagrantfile
├── provisioning/
│   ├── target.sh
│   └── setup.sh
└── README.md
```

Then I can potentially recreate the lab on another machine with the same basic structure.

Vagrant can also provision the guest after creating it:

```ruby
config.vm.provision "shell", path: "provisioning/setup.sh"
```

This is where Vagrant starts becoming much more interesting than simply being a replacement for `virt-install`.

It gives me **Infrastructure-as-Code for the virtual lab**.

---

# Vagrant vs Docker

There is an important distinction here.

Docker containers generally look like:

```
Host kernel
    │
    ├── container
    ├── container
    └── container
```

A VM looks like:

```
Host
 │
 └── hypervisor
       │
       ├── VM
       ├── VM
       └── VM
```

Containers share the host kernel.

Virtual machines have their own guest kernel.

For a cybersecurity lab where I want:

```
Linux attacker
Windows target
vulnerable Linux target
```

VMs make much more sense because I am interested in interacting with different operating systems and kernels, not just isolated applications.

Vagrant doesn’t change this.

It simply makes the VM environment easier to reproduce.

---

# Why I didn’t start with Vagrant

Ironically, Vagrant could have made the whole process much easier.

But that would have defeated part of the purpose.

If I had started with:

```bash
vagrant up
```

I might have learned:

> “This command makes a VM.”
> 

Instead, I wanted to understand:

```
/dev/kvm
   ↓
KVM
   ↓
QEMU
   ↓
libvirt
   ↓
virt-install / virsh / virt-manager
   ↓
virtual hardware
   ↓
guest OS
```

Now, if I eventually use Vagrant, I understand what it is automating.

That is a much better position to be in.

---

# The final topology

I ended up with two separate virtual environments because they serve two completely different purposes.

## INS lab

This is the network I built for my Information and Network Security class.

```
                         Fedora Host
                              │
                          labnet_lab
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           Windows       Metasploitable      Kali
            target          target         Distrobox
```

The vulnerable machines live here.

Kali is my attacker environment for this network.

The Fedora host itself can also interact with the network.

## HTB environment

```
                         Fedora Host
                              │
                           default
                              │
                           ParrotOS
                              │
                           HTB VPN
                              │
                         Hack The Box
```

Parrot is my standalone HTB workstation.

---

# My setup

This is the setup I ended up using while writing this.

## Hardware

```
Laptop:
Acer Predator PHN16-71

CPU:
Intel Core i9-13900HX

GPU:
NVIDIA RTX 4060 Laptop GPU

RAM:
16 GB

Display:
2560 × 1600
```

The 16 GB RAM is probably the biggest constraint when running multiple VMs.

For example, running:

```
Parrot      4 GB
Windows     4 GB
Metasploit  512 MB
```

already puts a significant chunk of the machine’s memory into VMs before Fedora, QEMU, libvirt and everything else are considered.

This is why I generally kept the main machines around 4 GB rather than throwing 8 or 16 GB at them.

---

## Host OS

```
Fedora Linux
```

The virtualization stack is:

```
Linux
  │
KVM
  │
QEMU
  │
libvirt
  │
virt-install / virsh / virt-manager
```

My user is also part of the relevant groups:

```bash
groups
```

which includes:

```
wheel
kvm
libvirt
```

---

## Virtualization versions

At the time of writing, the versions on my machine were:

```
libvirt:
12.0.0

QEMU:
10.2.2

virt-install:
5.1.0
```

I checked these with:

```bash
virsh version
```

which returned:

```
Compiled against library: libvirt 12.0.0
Using library: libvirt 12.0.0
Using API: QEMU 12.0.0
Running hypervisor: QEMU 10.2.2
```

and:

```bash
virt-install --version
```

which returned:

```
5.1.0
```

I also checked the OS variants known to `osinfo`:

```bash
osinfo-query os | grep -i debian
```

and had:

```
debian13 | Debian 13 | 13
```

available, which is what I used as the `--os-variant` for Parrot.

---

## VMs

The main VMs in the setup are:

```
metasploitable
    │
    └── vulnerable target for INS lab

windows-lab
    │
    └── Windows target for INS lab

parrot-htb
    │
    └── standalone HTB workstation
```

The storage lives under:

```
/var/lib/libvirt/images/
```

so the disks look roughly like:

```
/var/lib/libvirt/images/
├── metasploitable.qcow2
├── windows-lab.qcow2
└── parrot-htb.qcow2
```

The Windows installation ISO and VirtIO driver ISO were kept under:

```
/var/lib/libvirt/boot/
```

---

## Networks

There are two important libvirt networks in my setup:

```
default
labnet
```

`default` is used by my standalone Parrot HTB VM.

`labnet` is my private INS class network:

```
192.168.100.0/24
```

with the virtual gateway:

```
192.168.100.1
```

and a DHCP range such as:

```
192.168.100.10
-
192.168.100.100
```

The intended architecture is:

```
                         Fedora Host
                              │
              ┌───────────────┴────────────────┐
              │                                │
            labnet                           default
              │                                │
        ┌─────┼─────┐                      Parrot
        │     │     │
     Windows Meta   Kali
               Distrobox
```

The two networks are deliberately separate.

---

# Final thoughts

The biggest thing I took away wasn’t how to install a VM.

It was that **a VM isn’t a single thing**.

When I say:

> “I have a Windows VM.”
> 

I’m actually talking about a collection of layers:

```
Physical hardware
      │
      ▼
Linux kernel
      │
      ▼
KVM
      │
      ▼
QEMU
      │
      ├── virtual CPU
      ├── virtual RAM
      ├── virtual disk
      ├── virtual NIC
      ├── virtual TPM
      ├── virtual display
      └── virtual firmware
              │
              ▼
          Guest OS
              │
              ▼
         Applications
```

And sitting above QEMU/KVM is another layer:

```
virt-manager
virsh
virt-install
      │
      ▼
   libvirt
      │
      ▼
   QEMU/KVM
```

Then there are even more abstractions around specific resources:

```
libvirt
 ├── domains       → VMs
 ├── networks      → virtual networks
 ├── storage pools → storage management
 ├── volumes       → virtual disks
 └── snapshots     → rollback points
```

Once I understood that, a lot of the weird errors stopped being mysterious.

A permission error on a QCOW2 wasn’t “QEMU being weird”; it was the **QEMU process having a different identity** from my shell.

A missing Windows disk wasn’t “Windows failing”; it was the guest **missing a VirtIO driver**.

A UEFI security violation wasn’t “Parrot being broken”; it was **virtual firmware enforcing Secure Boot**.

`qemu:///session` and `qemu:///system` weren’t two versions of QEMU; they were **two different libvirt scopes**.

And `/dev/kvm` wasn’t a virtual machine; it was the **kernel interface through which QEMU gets hardware-assisted virtualization**.

The fact that I could put Windows, Metasploitable, my Fedora host, and Kali into one private network while keeping Parrot in a completely separate HTB environment also made the networking side of virtualization much more tangible.

That, more than anything, is why I’m glad I didn’t just install VirtualBox.

I wanted the feeling of:

> **“I did something.”**
> 

And the extra tinkering actually taught me something.