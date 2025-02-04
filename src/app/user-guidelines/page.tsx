import Link from "next/link";
import styles from "./page.module.scss"
import Image from "next/image";


export default function UserGuidelines() {
  return (
    <>
      <main className={styles.main}>
        <Link href="/chat"><div className={styles.logoRow}>
        <Image src="/assets/logo.png" alt="me" width="20" height="20" />
        <h2 className={styles.logoTitle}>Veracity AI</h2>
        </div></Link>
      <h1 className={styles.title}>User Guidelines</h1>
<p>Thanks for trying out veri-fact.ai. It uses AI (specifically a &ldquo;Large Language Model&rdquo; (LLM)) to summarize relevant text from reliable sources retrieved from the internet. Some things to consider when using it:</p>
<ul>
  <li>The app will always give a response. To get a sensible response, ensure what you submit is &lsquo;fact-checkable&rsquo;. We suggest:
    <ul>
      <li>Making sure there is a verifiable statement expressed somewhere in the text you submit. You are not likely to get sensible results from checking an opinion, a difficult-to-verify reason for something, or a little-known fact.</li>
      <li>(For the time being until we include the feature to process multiple statements) Making sure there is <em>only</em> 1 statement.</li>
    </ul>
  </li>
  <li>You may still not get a sensible response, because <strong>LLMs can sometimes give wrong (and often &ldquo;sounds right&rdquo;) explanations</strong> as an answer.</li>
  <li>It&apos;s up to us, if we want to use these systems, to <strong>assess the quality of the LLM&rsquo;s response</strong> and have a sense for when the AI may have trouble giving a reliable response:
    <ol>
      <li>Is the statement you want to fact-check well-known enough that it is likely to appear in multiple places on the internet? Some cases where it may not:
        <ul>
          <li><em>a breaking news event</em>: there may not be very many websites with relevant content and those search results that are returned may be of low reliability since the sources mentioning the event are likely either random passersbys with little understanding of the context or involved parties that might have hidden motives in how they talk about it.
            <em>Suggestion</em>: Double-check the sources to the right of our page. Do they sound familiar? Do they look typical?</li>
        </ul>
        If not, you may want to be more skeptical about the answer the system returns.
      </li>
      <li>What if all the sources analyzed have low or absent source credibility? The system will likely identify this in its answer, but it is always good to check the source credibility scores for yourself. Note that the database veri-fact.ai uses only has so many entries. If the returned website comes from a source that isn&apos;t in the database, that doesn&apos;t necessarily mean it is unreliable, but it does indicate it is not a well-known source. The less well-known a source is, the less likely it is to be based on expert knowledge.</li>
    </ol>
  </li>
  <li>Using LLMs to help us fact-check is a new area of research where new ways of doing it are proposed frequently and how well they do is also improving. The developers of veri-fact.ai aim to use the most up-to-date research about how to best use LLMs for fact-checking. They also hope to improve it and you can help here! You are invited to <strong>share your feedback</strong> that will be used to identify and try to correct problems you encounter, as well as to improve the overall user experience. The veri-fact.ai Team thanks you in advance for your participation in this collective experiment to better ground our public discussions in factuality!</li>
  <li>If you would like to know more technical details about how the AI behind the app works click <Link href="/how-the-ai-works">here.</Link></li>
</ul>
      </main>

      </>
  );
}