# Encrypt Once, Boot Forever: TPM2 Auto-Unlock on Fedora 44

When I set up Fedora 44 on my Predator Helios Neo 16, I enabled full
disk encryption using LUKS. Non-negotiable for a cybersecurity student.

The problem: every boot starts with a password prompt before anything
loads. Fine in principle, friction in practice — especially when you're
rebooting frequently during a fresh system setup.

The solution: seal the decryption key inside the TPM chip and let the
hardware unlock the drive automatically on legitimate boots. No password
prompt, full encryption intact.

This is how I set it up.

---

## Understanding the pieces

### LUKS

**LUKS (Linux Unified Key Setup)** is the standard disk encryption layer on
Linux. When enabled, your entire partition is encrypted at rest. Before
the OS can boot, something needs to provide the decryption key —
normally that's you, typing a passphrase.

LUKS2 (the modern version, default on Fedora) supports multiple keyslots
and tokens. Think of keyslots as different keys to the same lock — you
can have a passphrase keyslot and a TPM keyslot simultaneously. Either
one unlocks the drive.

### TPM2

**TPM (Trusted Platform Module)** is a dedicated security chip on your
motherboard. It's not software — it's physical hardware that stores
cryptographic secrets and enforces conditions on when those secrets are
released.

The relevant capability here: the TPM can **seal** a secret to specific
system state measurements. It will only release that secret if the
system is in the expected state. Move the SSD to another machine? No
TPM. Different hardware state? Key not released. Your data stays
encrypted.

### PCRs

PCR stands for **Platform Configuration Register**. These are values inside
the TPM that represent measurements of different stages of your boot
process — fingerprints of your firmware, bootloader, Secure Boot
configuration, and so on.

When you seal a key to a PCR, you're saying: "only release this key if
PCR X has this exact value." The key relevant PCRs:

| PCR | What it measures |
| --- | --- |
| 0 | UEFI firmware |
| 7 | Secure Boot state |
| 14 | Shim/bootloader |

I bound to **PCR 7** — the Secure Boot state. This means:

- The key is released as long as Secure Boot policy hasn't changed
- Firmware updates don't break it (PCR 0 would)
- It's the right balance of security and usability for a daily driver

### systemd-cryptenroll

`systemd-cryptenroll` is a tool built directly into systemd for
enrolling hardware security tokens — including TPM2 — as LUKS keyslots.

I initially tried **clevis**, the older and more commonly documented
approach. The bind command ran without errors, the tokens appeared in the
LUKS dump, dracut rebuilt successfully — but the password prompt kept
appearing at boot. After debugging, the clevis dracut module simply
wasn't making it into the initramfs reliably on Fedora 44.

`systemd-cryptenroll` solved it on the first try. On Fedora 44 with
modern systemd, it's the right tool — tighter initramfs integration, no
additional packages needed, and it just works.

---

## The setup

### Prerequisites

- Fedora 44 with LUKS2 full disk encryption enabled
- Secure Boot on (verify in BIOS)
- TPM2 chip (verify below)

### Step 1: Verify TPM2 is available

```bash
ls /dev/tpm*
# Expected: /dev/tpm0  /dev/tpmrm0

systemd-cryptenroll --tpm2-device=list
# Expected: shows your TPM2 device with driver info
```

My output:

```bash
PATH        DEVICE      DRIVER
/dev/tpmrm0 INTC6001:00 tpm_crb
```

The `tpm_crb` driver is the Intel TPM 2.0 on the i9-13900HX platform.
If you see output here, you're good.

### Step 2: Identify your LUKS partition

```bash
lsblk
cat /etc/crypttab
```

My crypttab:

```bash
luks-67669a3d-... UUID=67669a3d-... none discard,x-initrd.attach
```

The partition is `/dev/nvme0n1p7`, UUID `67669a3d-...`. Note your UUID
— you'll need it.

### Step 3: Enroll the TPM2 key

```bash
sudo systemd-cryptenroll \\
  --tpm2-device=auto \\
  --tpm2-pcrs=7 \\
  /dev/nvme0n1p7
```

Enter your existing LUKS passphrase when prompted. This authorizes
adding a new keyslot. The command:

1. Generates a new random key
2. Seals it inside the TPM against the current PCR 7 value
3. Adds it as a new LUKS2 keyslot with a `systemd-tpm2` token

Your original passphrase keyslot is untouched.

Verify the enrollment:

```bash
sudo cryptsetup luksDump /dev/nvme0n1p7 | grep -A3 "Tokens"
```

You should see a `systemd-tpm2` token entry.

### Step 4: Update crypttab

```bash
sudo nano /etc/crypttab
```

Change the line from:

```bash
luks-UUID UUID=UUID none discard,x-initrd.attach
```

To:

```bash
luks-UUID UUID=UUID - discard,x-initrd.attach,tpm2-device=auto,tpm2-pcrs=7
```

Two changes: `none` becomes `-` (means "no keyfile, use token"), and
`tpm2-device=auto,tpm2-pcrs=7` is appended to the options. This tells
the initramfs to attempt TPM2 unlock before falling back to passphrase.

### Step 5: Rebuild initramfs

```bash
sudo dracut --force --regenerate-all
```

This rebuilds the initramfs for all installed kernels, baking in the
TPM2 unlock logic. Let it complete fully before rebooting.

### Step 6: Reboot

```bash
sudo reboot
```

The boot sequence should now go straight from GRUB to the KDE login
screen — no passphrase prompt. The TPM provides the key automatically
during the initramfs stage.

---

## Security model

This setup gives you encryption at rest against the realistic threat:
physical theft of the device or SSD.

**Protected against:**

- SSD removed and accessed on another machine — no TPM, no key
- Cold boot attacks on a powered-off or hibernated system
- Forensic disk imaging without your hardware

**Not protected against:**

- Someone stealing your running, logged-in laptop
- Evil maid attacks with full hardware access over time
- Your passphrase being compromised (keep it safe regardless)

The passphrase remains your fallback. If the TPM fails, if you flash
firmware, or if Secure Boot state changes, the TPM unlock breaks and
you'll be prompted for the passphrase. Enter it, boot normally, then
re-run the `systemd-cryptenroll` command to re-seal to the new state.

---

## What breaks the seal

These events change PCR 7 and will require re-enrollment:

- Flashing BIOS/UEFI firmware
- Toggling Secure Boot in BIOS settings
- TPM hardware failure or reset

When this happens: passphrase at boot → login → re-run step 3 →
rebuild initramfs → done.

---

## Hardware

Acer Predator Helios Neo 16

Intel i9-13900HX · RTX 4060 · 16GB RAM · 1TB NVMe

Fedora Linux 44 (KDE Plasma Desktop Edition)