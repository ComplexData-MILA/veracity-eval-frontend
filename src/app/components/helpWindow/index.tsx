import styles from "../../chat/page.module.scss";



export default function HelpWindow() {

  return (
    <section className={styles.helpSection}>
        <h2 className={styles.helpHeading}>Frequently Asked Questions</h2>
        <p className={styles.helpText}>What is this?</p>
        <p className={styles.helpTextResponse}>veri-fact.ai is a tool to help you assess how true a claim is.</p>
        <p className={styles.helpText}>How does it work?</p>
        <p className={styles.helpTextResponse}>veri-fact.ai is an AI chatbot that summarizes relevant text from reliable sources retrieved from the internet.</p>
        <p className={styles.helpText}>How do I use it?</p>
        <p className={styles.helpTextResponse}>Type or paste text of a claim into the text box located at the bottom of this page and press the checkmark or enter to get a response.</p>
        <p className={styles.helpText}>What does it know?</p>
        <p className={styles.helpTextResponse}>It searches the internet for answers and presents what it finds.</p>
        <p className={styles.helpText}>What is the reliability score?</p>
        <p className={styles.helpTextResponse}>A score from 0-100% that is outputted by veri-fact.ai to convey in a number how true a claim is.</p>
        <p className={styles.helpText}>What is source credibility?</p>
        <p className={styles.helpTextResponse}>A score from 0-100% that is obtained from an existing, research-validated database of source credibility.</p>
        <p className={styles.helpText}>Why are you telling me not to share?</p>
        <p className={styles.helpTextResponse}>False information shared widely can corrode the health of our digital space. veri-fact.ai helps you detect false information so you don’t share it.</p>
       </section>
  );
}