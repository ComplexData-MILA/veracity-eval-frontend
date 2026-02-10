"use client";

/**
 * Next.js home page — static shell for the extension panel.
 * This markup is exported as HTML; postbuild then replaces the body with
 * a single root div and injects panel.js. All behavior (auth, verify button,
 * tabs, results, discussion hub) comes from the inlined script in
 * scripts/postbuild.js.
 */
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Head>
        <title>Veracity</title>
      </Head>
      <section className={styles.panel}>
        <div id="authView" className={styles.authHero}>
          <div className={styles.heroIcon} aria-hidden="true">V</div>
          <div className={styles.heroEyebrow}>Welcome to Veracity</div>
          <div className={styles.heroTitle}>
            Navigate information with clarity and confidence guided by{" "}
            <span className={styles.heroBlue}>a conversational</span>{" "}
            <span className={styles.heroGreen}>assistant.</span>
          </div>
          <div className={styles.heroSubtext}>
            Sign up or log in to verify information and build trust with those you share it with.
          </div>
          <div className={styles.heroButtons}>
            <button id="authLoginBtn" className={styles.heroPrimaryBtn} type="button">Log in</button>
            <button id="continueWebAppBtn" className={styles.heroSecondaryBtn} type="button" hidden>I’m logged in → Continue</button>
          </div>
          <div id="authStatusText" className={styles.authStatus}></div>
        </div>

        <div
          className={styles.tabList}
          role="tablist"
          aria-label="Side panel sections"
          id="appTabs"
          hidden
        >
          <button type="button" role="tab" aria-selected="true" className={`${styles.tabButton} ${styles.tabButtonActive}`} data-tab-id="ai">
            <span className={styles.tabLabel}>AI Fact Verification</span>
          </button>
          <button type="button" role="tab" aria-selected="false" className={styles.tabButton} data-tab-id="discussion">
            <span className={styles.tabLabel}>Discussion Hub</span>
          </button>
          <button type="button" role="tab" aria-selected="false" className={styles.tabButton} data-tab-id="expert">
            <span className={styles.tabLabel}>Contact an Expert</span>
          </button>
        </div>

        <div className={styles.card} role="tabpanel" id="appContent" hidden>
          <div className={styles.headingRow}>
            <h2 className={styles.sectionTitle}>AI Fact Verification</h2>
            <span id="testBadge" className={styles.testBadge} hidden>
              TEST MODE (mock)
            </span>
          </div>
          <label className={styles.label} htmlFor="claimInput">
            Claim
          </label>
          <textarea
            id="claimInput"
            className={styles.textarea}
            placeholder="Type or paste a claim…"
            rows={4}
          />
          <div className={styles.buttonRow}>
            <button id="verifyBtn" className={styles.primaryBtn} type="button">
              Verify
            </button>
          </div>
          <div className={styles.scoreBox} id="scoreBox" hidden>
            <div className={styles.scoreValue} id="scoreValue">--</div>
            <div className={styles.scoreLabel}>Reliability</div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>© ComplexData Lab · McGill · Mila</footer>
    </main>
  );
}

