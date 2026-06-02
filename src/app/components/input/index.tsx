"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./input.module.scss";

/* NEW: local input mode for switching between text and media */
type VerificationMode = "text" | "media";

type Props = {
  setClaim: (arg0: string) => void;
  verifyClaim: () => void;
  claim: string;

  /* NEW: optional media backend handler from ChatWindow */
  verifyMedia?: (file: File) => void;
  isVerifyingMedia?: boolean;
};

/* NEW: media icon for the mode selector */
function MediaIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <path
        d="M4 17L9 12.5L13 16L15.5 13.5L20 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Input({
  setClaim,
  verifyClaim,
  claim,
  verifyMedia,
  isVerifyingMedia = false,
}: Props) {
  const t = useTranslations("chatpage");
  const [inputText, setInputText] = useState<string>("");

  /* NEW: keep mode local so ChatWindow does not need mode props */
  const [mode, setMode] = useState<VerificationMode>("text");

  /* NEW: local selected file state */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  /* NEW: prevents the same text claim from being verified repeatedly */
  const lastVerifiedClaimRef = useRef<string>("");
  const handleChange = (newText: string) => {
    setInputText(newText);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "text") {
      const trimmedText = inputText.trim();

      if (!trimmedText) return;

      setClaim(trimmedText);
      setInputText("");
      return;
    }

    /* NEW: media submit */
    if (mode === "media" && selectedFile) {
      if (verifyMedia) {
        verifyMedia(selectedFile);
      } else {
        console.log(
          "Media selected, but verifyMedia is not connected yet:",
          selectedFile.name
        );
      }
    }
  };

  useEffect(() => {
    // Access URL parameters using window.location.search
    const queryParams = new URLSearchParams(window.location.search);
    const q = queryParams.get("q");

    if (q) {
      const decodedQuery = decodeURIComponent(q);

      /* NEW: URL query should always submit as text */
      setMode("text");
      setInputText(decodedQuery);

      // Automatically trigger form submission
      setTimeout(() => {
        formRef.current?.dispatchEvent(new Event("submit", { bubbles: true }));
      }, 100);
    }
  }, []);

  useEffect(() => {
  /* Existing behavior, but only in text mode.
     The ref prevents repeated verification of the same claim. */
  if (
    mode === "text" &&
    claim !== "" &&
    lastVerifiedClaimRef.current !== claim
  ) {
    lastVerifiedClaimRef.current = claim;
    verifyClaim();
  }
}, [claim, mode, verifyClaim]);

  return (
    <form ref={formRef} className={styles.inputWrapper} onSubmit={handleSubmit}>
      {/* NEW: icon mode selector */}
      <div className={styles.modeToggle} aria-label="Verification mode">
        <button
          type="button"
          title="Verify text"
          aria-label="Verify text"
          className={`${styles.modeButton} ${
            mode === "text" ? styles.modeButtonActive : ""
          }`}
          onClick={() => setMode("text")}
        >
          Aa
        </button>

        <button
          type="button"
          title="Verify media"
          aria-label="Verify media"
          className={`${styles.modeButton} ${
            mode === "media" ? styles.modeButtonActive : ""
          }`}
          onClick={() => setMode("media")}
        >
          <MediaIcon />
        </button>
      </div>

      {mode === "text" ? (
        <input
          className={styles.input}
          placeholder={t("inputPlaceholder")}
          onChange={(e) => handleChange(e.target.value)}
          value={inputText}
        />
      ) : (
        /* NEW: styled file picker */
        <label className={styles.fileInputLabel}>
          <span className={styles.fileInputText}>
            {selectedFile ? selectedFile.name : "Choose media file"}
          </span>

          <input
            className={styles.hiddenFileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/x-matroska"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </label>
      )}

      <button
        className={styles.submit}
        type="submit"
        disabled={mode === "media" && (!selectedFile || isVerifyingMedia)}
      >
        {isVerifyingMedia ? (
          "..."
        ) : (
          <Image src="/assets/logoBlue.svg" alt="me" width="20" height="20" />
        )}
      </button>
    </form>
  );
}