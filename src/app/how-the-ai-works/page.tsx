import Link from "next/link";
import styles from "../privacy/page.module.scss"
import Image from "next/image";


export default function HowTheAiWorks() {
  return (
    <>
      <main className={styles.main}>
      <Link href="/chat"> <div className={styles.logoRow}>
        <Image src="/assets/logo.png" alt="me" width="20" height="20" />
        <h2 className={styles.logoTitle}>Veracity AI</h2>
        </div></Link>
      <h1 className={styles.title}>How the AI works</h1>
<p>Large Language Models (LLMs) are a powerful kind of instruction-ready AI chatbot. They are good at summarizing text like subject-matter experts would. Unlike experts, they can sometimes get basic things wrong in any number of ways. That&apos;s why asking them to reason on their own about how likely it is that a statement is true or false is not a reliable approach to using LLMs for fact-checking.</p>
<p>Veri-fact.ai takes a more reliable approach based on “Retrieval-Augmented Generation” or RAG for short. Here, this means having the LLM base its response on relevant text from reliable sources on the internet. Veri-fact.ai does this by:</p>

<ol>
  <li>Instructing the LLM to first come up with text that when pasted in the search bar of a search engine like Google Search will find content relevant to the statement being assessed. The search then returns a list of websites.</li>
  <li>Veri-fact.ai then extracts a main snippet of text from each website as well as a source credibility score obtained from a database we use.</li>
  <li>The LLM is then instructed to summarize all the sources’ text and scores with the purpose of answering how true is the original statement. The LLM is also instructed to provide a corresponding <em>reliability score</em> between 0 and 100% from very likely false to very likely true. The score is pulled out of the LLM directly--it is not calculated from an equation.</li>
</ol>

<p>There are a few minor additional steps to this process, e.g.:</p>

<ul>
  <li>Checking first to make sure what you entered can be interpreted as a statement.</li>
  <li>Getting the LLM to generate multiple search texts to improve the diversity in the returned search results.</li>
  <li>How to handle the situation when there aren’t many websites returned by the search.</li>
</ul>

<p>That&apos;s all there is to it. Now you know! See our <a href="/user-guidelines">User Guidelines</a> for more details on how to use the app.</p>

<p>An academic paper of an earlier version of the approach that goes into more technical detail is:</p>

<p>Jacob-Junqi Tian, Hao Yu, Yury Orlovskiy, Tyler Vergho, Mauricio Rivera, Mayank Goel, Zachary Yang, Jean-François Godbout, Reihaneh Rabbany, & Kellin Pelrine (2024). <strong>Web Retrieval Agents for Evidence-Based Misinformation Detection</strong>. In First Conference on Language Modeling. [LINK]</p>

<p>Some additional notes:</p>

<ul>
  <li><strong>Why does this work at all?</strong> LLMs sometimes being wrong means that the conclusion of the app about how true the statement is, the summary it provides in support of that conclusion, as well as the reliability score itself can potentially all be misleading. That said, LLMs do very well at summarizing text. It is less obvious that the LLM will return a sensible reliability score. However, studies that have compared these score numbers do show high (but not perfect) overlap (see this <a href="https://arxiv.org/pdf/2305.14928">reference</a> for more detail). This is possible because there are numbers given in discussions about real events written all over the internet and the LLM was trained with lots of this internet data.</li>
  <li>Veri-fact.ai uses a particular database of source reliability scores that assign a score to a web domain name (like a news outlet cnn.com or a government us.gov). There is a handful of such databases out there. One study has collected some of these and shown they give <a href="https://www.google.com/url?q=https://doi.org/10.1093/pnasnexus/pgad286&sa=D&source=docs&ust=1738350980635922&usg=AOvVaw2L0zAoYLG6TpmtU-5y8JLS">similar reliabilities</a>. They also made a composite score from a standard way of combining them. We use the database they provide of this composite score.</li>
</ul>
      </main>
      </>
  );
}