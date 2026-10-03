"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "style"> & {
  style?: React.CSSProperties;
};

// Password field with an eye button to reveal what was typed.
export default function PasswordInput({ style, ...rest }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input {...rest} type={show ? "text" : "password"} style={{ ...style, paddingRight: 42 }} />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        title={show ? "Hide password" : "Show password"}
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: show ? "#39BD69" : "rgba(255,255,255,0.4)" }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
