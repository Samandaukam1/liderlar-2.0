"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Foydalanuvchi kirganmi — FAQAT KO'RINISH UCHUN (header tugmasi).
 *
 * Sessiya brauzer cookie'sidan mahalliy o'qiladi, tarmoq so'rovi yo'q.
 * Bu AVTORIZATSIYA EMAS: kabinet va har bir amal huquqni serverda
 * qayta tekshiradi. Bu yerda xato bo'lsa, eng yomoni — tugmada
 * "Kirish" o'rniga "Kabinet" yozuvi.
 *
 * Avval header har doim "Kirish" ko'rsatardi — kabinet ichida ham.
 */
export function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return signedIn;
}
