import Link from "next/link";
import styles from "./page.module.scss"
import Image from "next/image";


export default function Privacy() {
  return (
    <>
      <main className={styles.main}>
    <Link href="/chat"><div className={styles.logoRow}>
        <Image src="/assets/logo.png" alt="me" width="20" height="20" />
        <h2 className={styles.logoTitle}>Veracity AI</h2>
    </div></Link>
    {/*<!--Privacy section-->*/}
    <h1 className={styles.title}>Privacy Policy</h1>
    <p><b>Effective Date:</b> March 31, 2025.
    <br />
        The Veri-Fact team, a part of the Complex Data Lab, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fact checker. Please read this policy carefully to understand our practices regarding your information.
    </p>
    <h2 className={styles.contentTitle}>1. Information We Collect</h2>
    <p>We may collect the following types of information:</p>
    <h3 className={styles.contentSubtitle}>a. Personal Information</h3>
    <p>Information you voluntarily provide to us, such as:</p>
    <ul>
        <li>Email address</li>
        <li>Information provided while using the app</li>
    </ul>
    <h3 className={styles.contentSubtitle}>b. Non-Personal Information</h3>
    <p>Information collected automatically, such as:</p>
    <ul>
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device information</li>
    </ul>
    <h2 className={styles.contentTitle}>2. How We Use Your Information</h2>
    <p>We may use your information for purposes including, but not limited to:</p>
    <ul>
        <li>Providing and improving our services</li>
        <li>Providing aggregate information about app usage to researchers and experts</li>
        <li>Responding to your inquiries</li>
        <li>Sending updates, promotions, or service-related announcements</li>
        <li>Ensuring website security</li>
    </ul>
    <h2 className={styles.contentTitle}>3. Sharing Your Information</h2>
    <p>
        We do not sell your personal information. However, we may share your information with third parties under the following circumstances:
    </p>
    <ul>
        <li>If required by law or to comply with legal processes</li>
        <li>To protect our rights, property, or safety, or that of others</li>
    </ul>
    <h2 className={styles.contentTitle}>4. Cookies and Tracking Technologies</h2>
    <p>We use cookies and similar tracking technologies to enhance your experience on our website. These may include:</p>
    <ul>
        <li>Essential cookies for website functionality</li>
    </ul>
    <p>You can manage or disable cookies through your browser settings.</p>
    <h2 className={styles.contentTitle}>5. Data Security</h2>
    <p>We implement reasonable measures to protect your information from unauthorized access, alteration, or disclosure. However, no data transmission or storage system is 100% secure. Use our services at your own risk.</p>
    <h2 className={styles.contentTitle}>6. Your Rights</h2>
    <p>Depending on your location, you may have rights regarding your personal information, including:</p>
    <ul>
        <li>Accessing the information we hold about you </li>
        <li>Requesting corrections or updates to your information </li>
        <li>Requesting deletion of your information (subject to applicable laws) </li>
        <li>Opting out of marketing communications</li>
    </ul>
    <p>To exercise these rights, contact us at taylor.curtis@mila.quebec.</p>
    <h2 className={styles.contentTitle}>7. Third-Party Links</h2>
    <p>Our website will contain links to third-party websites. We are not responsible for the privacy practices of these websites. Please review their privacy policies before providing any information.</p>
    <h2 className={styles.contentTitle}>8. Changes to This Privacy Policy</h2>
    <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page, and the &quot;Effective Date&quot; will be updated. Please review this policy periodically for updates.
    </p>
    <h2 className={styles.contentTitle}>9. Contact Us</h2>
    <p>
        If you have any questions or concerns about this Privacy Policy, please contact Taylor Lynn Curtis, the project coordinator, at&nbsp;
        <a href="mailto:taylor.curtis@mila.quebec"><u>taylor.curtis@mila.quebec</u></a>
    </p>
    {/*<!--TOS section-->*/}
    <h1 className={styles.title}>Terms of Service</h1>
    <p><strong>Effective Date:</strong> March 31, 2025</p>
    <p>Welcome to Veri-Fact! By accessing or using our website, platform, or services (the &quot;Service&quot;), you agree to be bound by these Terms of Service (the &quot;Terms&quot;). Please read them carefully. If you do not agree with these Terms, you may not use the Service.</p>
    <h2 className={styles.contentTitle}>1. Acceptance of Terms</h2>
    <p>By accessing or using the Service, you confirm that you are at least 18 years old or have the legal capacity to enter into this agreement.</p>
    <h2 className={styles.contentTitle}>2. Use of the Service</h2>
    <p>You agree to use the Service only for lawful purposes and in compliance with these Terms. Specifically, you agree not to:</p>
    <ul>
        <li>Violate any applicable laws or regulations.</li>
        <li>Use the Service to transmit malicious code or harm other users.</li>
        <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
        <li>Exploit or misuse any part of the Service in a manner not intended by Veri-Fact.</li>
    </ul>
    <h2 className={styles.contentTitle}>3. Account Registration and Security</h2>
    <p>To access certain features of the Service, you may be required to create an account. You agree to:</p>
    <ul>
        <li>Provide accurate and complete information during registration.</li>
        <li>Keep your account credentials confidential and secure.</li>
        <li>Notify us immediately if you suspect unauthorized use of your account.</li>
    </ul>
    <h2 className={styles.contentTitle}>4. Content Ownership and Licensing</h2>
    <ul>
        <li><strong>Your Content:</strong> You retain ownership of any content you submit to the Service. However, by submitting content, you grant Veri-Fact and its creator The Complex Data Lab a worldwide, royalty-free, non-exclusive license to use, modify, reproduce, and display your content for the purpose of operating the Service.</li>
        <li><strong>Our Content:</strong> The Service and its content, including but not limited to text, graphics, logos, and software, are the intellectual property of The Complex Data Lab or its licensors and are protected by copyright, trademark, and other intellectual property laws.</li>
    </ul>
    <h2 className={styles.contentTitle}>5. Privacy</h2>
    <p>Your use of the Service is subject to our Privacy Policy, which explains how we collect, use, and protect your personal information.</p>
    <h2 className={styles.contentTitle}>6. Disclaimers and Limitations of Liability</h2>
    <ul>
        <li>The Service is provided &quot;as is&quot; without warranties of any kind, either express or implied.</li>
        <li>Veri-Fact is not responsible for the accuracy, reliability, or completeness of any content or information provided by the Service.</li>
        <li>To the fullest extent permitted by law, Veri-Fact is not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</li>
    </ul>
    <h2 className={styles.contentTitle}>7. Termination</h2>
    <p>We reserve the right to suspend or terminate your access to the Service at any time for any reason, including but not limited to violations of these Terms.</p>
    <h2 className={styles.contentTitle}>8. Changes to the Terms</h2>
    <p>We may update these Terms from time to time. Any changes will be posted on this page with a &quot;Last Updated&quot; date. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
    <h2 className={styles.contentTitle}>9. Governing Law and Disputes</h2>
    <p>These Terms are governed by the laws of Quebec, Canada. Any disputes will be resolved exclusively in the courts of Quebec, Canada.</p>
    <h2 className={styles.contentTitle}>10. Contact Information</h2>
    <p>For any questions or concerns regarding these Terms, please contact Taylor Lynn Curtis, the project coordinator at:</p>
    <p>Email: <a href="mailto:taylor.cutis@mila.quebec">taylor.cutis@mila.quebec</a></p>
</main>
    </>
  );
}