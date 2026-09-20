"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
import { formatDateUz } from "@/lib/utils";
import {
  MEHR_ROLE_LABEL,
  MEHR_STATUS_LABEL,
  type MehrActivitySummary,
} from "@/lib/mehr/member-types";
import { EvidenceForm } from "./evidence-form";

/**
 * Kabinetdagi bitta ezgulik ishi qatori.
 *
 * Mijoz komponenti, chunki dalil formasi ochilishi/yopilishi
 * shu yerda boshqariladi. Ma'lumotning o'zi serverda
 * tayyorlanadi — bu yerda hech qanday so'rov yo'q.
 */
export function ActivityRow({ activity }: { activity: MehrActivitySummary }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-md border border-brand-soft px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="min-w-0">
          <span className="font-semibold text-navy">{activity.title}</span>
          <span className="ml-2 text-xs text-ink-soft">
            {MEHR_ROLE_LABEL[activity.role] ?? activity.role}
          </span>
        </span>

        <span className="flex items-center gap-3">
          <span className="text-xs font-semibold text-ink-soft">
            {MEHR_STATUS_LABEL[activity.status] ?? activity.status}
            {activity.startsAt ? ` · ${formatDateUz(activity.startsAt)}` : ""}
          </span>

          {activity.canSubmitEvidence && !open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-liderlar-blue/50 px-3 text-xs font-bold text-liderlar-blue transition hover:bg-liderlar-blue/10"
            >
              <FilePlus2 className="h-3.5 w-3.5" aria-hidden />
              Dalil yuborish
            </button>
          )}
        </span>
      </div>

      {/*
        TUZATISH SO'RALGAN BO'LSA — SABABI KO'RINIB TURSIN.

        Odam nimani tuzatishini bilmasa, xuddi shu narsani
        qayta yuboradi va aylanma boshlanadi.
      */}
      {activity.status === "changes_requested" && (
        <p className="mt-1.5 text-xs text-amber-700">
          Admin tuzatish so&apos;ragan — dalilni to&apos;ldirib qayta yuboring.
        </p>
      )}

      {open && (
        <EvidenceForm
          activityId={activity.id}
          initialTitle={activity.title}
          hasCover={activity.hasCover}
          existingPhotoCount={activity.photoCount}
          startsAt={activity.startsAt}
          onClose={() => setOpen(false)}
        />
      )}
    </li>
  );
}
