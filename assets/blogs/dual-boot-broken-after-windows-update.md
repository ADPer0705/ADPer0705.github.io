# Dual Boot broken after Windows Updates - Fixing LUKS, NVIDIA and Time Sync

When my windows updated itself without asking me last night, I rebooted my PC, and GRUB menu didn’t show. It had happened, windows update messed up with my dual-boot setup again. 

Here’s all the things I had to do again after the update to get my Fedora back to normal. The main purpose of writing this blog is to have a list of things that needs to be done everytime this happens (this wasn’t the first, probably won’t be last), and maybe help someone with the same.

Now, like all good engineers, I thought about automating this, cause who wants to spend 5 minutes, maybe in a couple of months doing this manually, when they can automate.

Here’s the link to my [script](https://github.com/ADPer0705/bash/blob/97150587a9282fa7ea3a81655e3ac54db322e2b1/fed_fuck_windows_updates.sh). Please don’t mind the name. Everything below goes through what the script does.

# LUKS2 + TPM2 Auto-Unlock

Being a good security student, I have my disk encryption enabled in Fedora. But I didn’t want to enter the decryption password everytime I boot up, I have my login password for protection. So I had a Auto-Unlock setup with LUKS2 + TPM2, which no longer worked after the update.

I already have a blog going through how to setup it up for yourself [here](https://adper.me/blog/encrypt-once-boot-forever).

So, we first wipe existing TPM2 slot if any are present. This makes sure we don’t clutter the LUKS header keyslots on your NVMe drive. 

```bash
sudo systemd-cryptenroll --wipe-slot=tpm2 "$LUKS_DEVICE" || true
```

Next, we have to enroll a new fresh TPM2 key. 

```bash
sudo systemd-cryptenroll \
    --tpm2-device=auto \
    --tpm2-pcrs=7 "$LUKS_DEVICE"
```

Now, we have the keys setup for our disc encryption. For this to work, we have rebuild the INITRAMFS, but that is also needed for the following steps, so we’ll just do that at the end.

# NVIDIA

I have a RTX4060 in my laptop. Updates from windows, not just system updates but also when you update only the NVIDIA driver from windows, tends to break the GPU setup for linux in a dual boot setup. Here’s how we fix that.

First, we check is nvidia-smi can connect to the NVIDIA drivers. we do that by simply running `nvidia-smi` and seeing if we get our card in the output. 

Next, we check is `akmods` service is running properly. This is the handles the compilation of proprietary NVIDIA driver on your machine based on your specific linux kernel version. `akmods` is how fedora handles the proprietary drivers, in different systems it can also be `dkms`. Apart from that, most systems use a reverse-engineered open source driver called `nouveau` for graphics cards. Make sure that if you are using NVIDIA proprietary drivers you don’t have a conflict between the two, you have to properly disable `nouveau`. 

once we have made sure `akmods` (or the driver your system has) is properly running, we need to make sure that our module is available and loaded. The script I wrote handles this by 

- trying to fetch the info of graphics module : `modinfo "nvidia"`
- checking if the module is running : `lsmod | grep "nvidia"`

If either of the checks fails

- if nvidia-smi cannot connect to the driver
- if akmods is not available / running
- if the module is not available / not loaded

then we rebuild the NVIDIA module, by first removing any cached mods 

```bash
sudo rm -rf /var/cache/akmods/nvidia/* 
```

and then force rebuilding the modules : 

```bash
sudo akmods --force --rebuild
```

Note that the script and the code here is specific to my machine, if yours uses a different driver or a different graphics card, the exact details needs to be tweaked accordingly.

# Time Sync

I frequently had to switch between windows and fedora, so I had synced the clocks on my hardware for both of them. When windows updated, it changed that clock to my local time zone, which is IST. But, fedora and most other linux environments expects time to be in UTC.

We can check what the current datetime configurations are by doing `timedatectl status`. It’ll show what our timezone is and also if the time synchronization (i.e. NTP synchronization) is turned on. When you set it up, you also might have to change some configs in windows. 

To go back to having the hardware clock use UTC and not having to sync the clock everytime you switch between the two, you have to set the hardware clock (RTC) to UTC :

```bash
sudo timedatectl set-local-rtc 0 --adjust-system-clock
```

and then enable the NTP synchonization :

```bash
sudo timedatectl set-ntp true
```

NOTE : don’t worry, your system time will still be the time you set, this just sets the time on the hardware in your machine that holds the time, cause linux systems expect that to be in UTC, and may cause troubles in some cases.

# Conclusion

Lastly, once everything is done, we rebuild our INITRAMFS : 

```bash
sudo dracut --force --regenerate-all
```

`Dracut` is the module handling INITRAMFS for fedora and other similar distros. For debian, ubuntu and it’s derivatives you need to use `update-initramfs` and for Arch and other systems similar to that, you might have to use `mkinitcpio`. 

The last thing to do is to reboot your system, and everything hopefully will be back to normal.

### Secure Boot and MOK Enrollment

If you have Secure Boot enabled in your BIOS, rebuilding the module isn’t enough. You have to tell the motherboard to trust the newly built driver.

1. Generate a new key and sign the kernel modules:

```bash
sudo kmodgenca
```

1. Import that key into the UEFI’s trust database

```bash
sudo mokutil --import /etc/pki/akmods/certs/public_key.der
```

This’ll prompt you to create a temporary password. Remember that password. When you reboot, you’ll be intercepted by a blue **MOK Management** screen before GRUB. Select Enroll MOK, hit continue, and type that temporary password. 

If you are using `akmods` then it handles the signing of the drivers by itself and you don’t have to do that manually. It too when you run the command rebuild will prompt you for the password discussed above, and at reboot will show the blue screen. Follow the same instructions as discussed before. 

### Hardware

Most of the commands are specific to my system, which is a Acer Predator, dual booted with windows and Fedora, and it has a dedicated NVIDIA RTX graphics card. But you can still refer to this from a checklist point of view and tweak the commands specific to your system and configuration.
