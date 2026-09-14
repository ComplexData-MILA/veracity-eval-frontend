"use client"

import { useState } from "react";
import Image from 'next/image';
import { useTranslations } from "next-intl";
import styles from "./claimConfirm.module.scss";
import { ExtractedStatement, ExtractionNotice } from "@/app/types";

type Props = {
  statements: ExtractedStatement[];
  notice: ExtractionNotice;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  /** Send an edited statement back through extraction to filter out opinions. */
  onEditSubmit: (newText: string) => void;
  /** Fall back to fact-checking the text as-is, without extraction. */
  onCheckAsIs: () => void;
  onBack: () => void;
};

export default function ClaimConfirm({
  statements,
  notice,
  selectedId,
  onSelect,
  onConfirm,
  onEditSubmit,
  onCheckAsIs,
  onBack,
}: Props) {
  const t = useTranslations('chatpage');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>("");

  const startEditing = (statement: ExtractedStatement) => {
    setEditingId(statement.id);
    setDraftText(statement.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftText("");
  };

  const submitEdit = () => {
    const trimmed = draftText.trim();
    if (!trimmed) return;
    onEditSubmit(trimmed);
  };

  const noticeCopy = {
    no_claims: t('extractNoneNotice'),
    error: t('extractErrorNotice'),
    too_long: t('extractTooLongNotice'),
  };

  return (
    <div className={styles.cardRow}>
      <Image src={'/assets/logo.png'} alt='veri-fact logo' height={40} width={40} />
      <div className={styles.card}>
        {statements.length > 0 ? (
          <>
            <p className={styles.heading}>{t('extractHeading')}</p>
            <div role="radiogroup" aria-label={t('extractHeading')} className={styles.statementList}>
              {statements.map((statement) => (
                <div key={statement.id} className={styles.statementRow}>
                  {editingId === statement.id ? (
                    <>
                      <textarea
                        className={styles.editArea}
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        aria-label={t('editedStatementLabel')}
                      />
                      <div className={styles.rowActions}>
                        <button type="button" className={styles.smallSecondary} onClick={cancelEditing}>
                          {t('cancelEdit')}
                        </button>
                        <button
                          type="button"
                          className={styles.smallPrimary}
                          onClick={submitEdit}
                          disabled={!draftText.trim()}
                        >
                          {t('saveEdit')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selectedId === statement.id}
                        className={selectedId === statement.id ? styles.statementActive : styles.statement}
                        onClick={() => onSelect(statement.id)}
                      >
                        {statement.text}
                      </button>
                      <button type="button" className={styles.editButton} onClick={() => startEditing(statement)}>
                        {t('edit')}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={onBack}>
                {t('back')}
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={onConfirm}
                disabled={!selectedId || editingId !== null}
              >
                {t('confirm')}
              </button>
            </div>
          </>
        ) : notice !== null ? (
          <>
            <p className={styles.heading}>{noticeCopy[notice]}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={onBack}>
                {t('back')}
              </button>
              <button type="button" className={styles.primaryButton} onClick={onCheckAsIs}>
                {t('checkAsIs')}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
