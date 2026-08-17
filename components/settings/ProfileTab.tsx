"use client";

import { motion } from "framer-motion";
import { Camera } from "@phosphor-icons/react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Field, TextInput } from "../ui/Field";
import { fadeUp, ease } from "@/lib/motion";

export function ProfileTab() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.25, ease }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar initials="KB" size={64} />
          <button
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-ink text-bg"
          >
            <Camera size={13} weight="fill" />
          </button>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-ink">Kieron Bolt</p>
          <p className="text-[12.5px] text-ink-faint">kieron@treacysolar.ie</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <TextInput defaultValue="Kieron Bolt" />
        </Field>
        <Field label="Display name" helper="Shown to your team across the workspace">
          <TextInput defaultValue="kieron" />
        </Field>
        <Field label="Email address">
          <TextInput defaultValue="kieron@treacysolar.ie" type="email" />
        </Field>
        <Field label="Role" helper="Set by your workspace admin">
          <TextInput defaultValue="Systems Lead" disabled />
        </Field>
      </div>

      <Field label="Bio" helper="A short introduction visible on your profile card">
        <textarea
          rows={3}
          defaultValue="Systems lead at Treacy Solar."
          className="resize-none rounded-[10px] border border-border bg-bg px-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-border pt-5">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save changes</Button>
      </div>
    </motion.div>
  );
}
