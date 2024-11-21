import styles from "../../chat/page.module.scss";



export default function HelpWindow() {

  return (
    <section className={styles.helpSection}>
        <h2 className={styles.helpHeading}>Ressources d&apos;aide populaires</h2>
        <p className={styles.helpText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        <br />
        <br />
        <a href="www.google.ca">Link out</a>
        </p>
       </section>
  );
}