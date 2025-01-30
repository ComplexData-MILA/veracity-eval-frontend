import styles from "./page.module.scss"
import Image from "next/image";


export default function Privacy() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.logoRow}>
          <Image src="/assets/logo.png" alt="me" width="20" height="20" />
          <h2 className={styles.logoTitle}>Veracity AI</h2>
        </div>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p><b>Effective Date:</b> March 31, 2025</p>
        <p>
          The Veri-Fact team, a part of the Complex Data Lab, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fact checker. Please read this policy carefully to understand our practices regarding your information.
        </p>
        <h2>1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <h3>a. Personal Information</h3>
        <p>Information you voluntarily provide to us, such as:</p>
        <ul>
          <li>Email address</li>
          <li>Information provided while using the app</li>
        </ul>
        <h3>b. Non-Personal Information</h3>
        <p>Information collected automatically, such as:</p>
        <ul>
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device information</li>
        </ul>
        <h2>2. How We Use Your Information</h2>
        <p>We may use your information for purposes including, but not limited to:</p>
        <ul>
          <li>Providing and improving our services</li>
          <li>Providing aggregate information about app usage to researchers and experts</li>
          <li>Responding to your inquiries</li>
          <li>Sending updates, promotions, or service-related announcements</li>
          <li>Ensuring website security</li>
        </ul>
        <h2>3. Sharing Your Information</h2>
        <p>
          We do not sell your personal information. However, we may share your information with third parties under the following circumstances:
        </p>
        <ul>
          <li>If required by law or to comply with legal processes</li>
          <li>To protect our rights, property, or safety, or that of others</li>
        </ul>
        <h2>4. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar tracking technologies to enhance your experience on our website. These may include:</p>
        <ul>
          <li>Essential cookies for website functionality</li>
        </ul>
        <p>You can manage or disable cookies through your browser settings.</p>
        <h2>5. Data Security</h2>
        <p>We implement reasonable measures to protect your information from unauthorized access, alteration, or disclosure. However, no data transmission or storage system is 100% secure. Use our services at your own risk.</p>
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have rights regarding your personal information, including:</p>
        <ul>
          <li>Accessing the information we hold about you </li>
          <li>Requesting corrections or updates to your information </li>
          <li>Requesting deletion of your information (subject to applicable laws) </li>
          <li>Opting out of marketing communications</li>
        </ul>
        <p>To exercise these rights, contact us at taylor.curtis@mila.quebec.</p>
        <h2>7. Third-Party Links</h2>
        <p>Our website will contain links to third-party websites. We are not responsible for the privacy practices of these websites. Please review their privacy policies before providing any information.</p>
        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page, and the &quot;Effective Date&quot; will be updated. Please review this policy periodically for updates.
        </p>
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please contact Taylor Lynn Curtis, the project coordinator, at&nbsp;
          <a href="mailto:taylor.curtis@mila.quebec"><u>taylor.curtis@mila.quebec</u></a>
        </p>

        <h1>Terms of Service</h1>
      </main>
    </>
  );
}