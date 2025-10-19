import React from 'react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8">
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Introduction</h2>
          <p className="mb-3">
            OJTech ("we", "our", or "us") is committed to protecting your privacy and personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p>
            This policy is crafted in compliance with the Philippines' Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Privacy Rights</h2>
          <p className="mb-3">Under the Data Privacy Act of 2012, you have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right to be informed</strong> - You have the right to be informed whether your personal data is being processed.</li>
            <li><strong>Right to access</strong> - You have the right to reasonable access to your personal data.</li>
            <li><strong>Right to object</strong> - You have the right to object to the processing of your personal data.</li>
            <li><strong>Right to erasure or blocking</strong> - You have the right to suspend, withdraw, or order the blocking, removal, or destruction of your personal data.</li>
            <li><strong>Right to damages</strong> - You have the right to be indemnified for damages sustained due to inaccurate, incomplete, outdated, false, unlawfully obtained, or unauthorized use of personal data.</li>
            <li><strong>Right to data portability</strong> - You have the right to obtain and transfer your data in an electronic or structured format.</li>
            <li><strong>Right to rectification</strong> - You have the right to dispute and have corrected any inaccuracy or error in the data we hold about you.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
          <p className="mb-3">We collect the following types of information:</p>
          <h3 className="text-lg font-medium mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Name, email address, and contact information</li>
            <li>Educational background and work experience</li>
            <li>Skills, certifications, and qualifications</li>
            <li>Resume and portfolio materials</li>
            <li>Profile pictures and biographical information</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Non-Personal Information</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Browser type and device information</li>
            <li>IP address and geolocation data</li>
            <li>Log data and usage statistics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="mb-3">We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To create and maintain your account on our platform</li>
            <li>To match you with relevant internship opportunities</li>
            <li>To facilitate communication between students and employers</li>
            <li>To improve our AI matching algorithms and platform functionality</li>
            <li>To provide customer support and respond to your inquiries</li>
            <li>To send you notifications and updates related to your application process</li>
            <li>To comply with legal obligations and enforce our terms of service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Retention and Security</h2>
          <p className="mb-3">
            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
            unless a longer retention period is required or permitted by law.
          </p>
          <p className="mb-3">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
            or unlawful processing, accidental loss, destruction, or damage. These measures include encryption, access controls, 
            regular security assessments, and data minimization procedures.
          </p>
          <p>
            In accordance with the Data Privacy Act of 2012, we have appointed a Data Protection Officer (DPO) who is 
            responsible for overseeing our data protection strategy and implementation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Third-Party Disclosure</h2>
          <p className="mb-3">
            We may share your information with the following third parties:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Employers using our platform (for student users)</li>
            <li>Service providers and business partners who assist in platform operations</li>
            <li>Legal and regulatory authorities when required by law</li>
          </ul>
          <p>
            All third parties with whom we share your data are required to process your personal information in a manner 
            consistent with this Privacy Policy and the Data Privacy Act of 2012.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy 
            Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p className="mb-3">
            If you have any questions about this Privacy Policy or would like to exercise your data privacy rights, 
            please contact our Data Protection Officer at:
          </p>
          <p className="mb-1"><strong>Email:</strong> privacy@ojtech.ph</p>
          <p className="mb-1"><strong>Address:</strong> OJTech Office, Manila, Philippines</p>
          <p><strong>Phone:</strong> +63 (2) 8XXX-XXXX</p>
        </section>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="italic text-gray-500 dark:text-gray-400 text-sm">
            This privacy policy is compliant with the Philippines' Data Privacy Act of 2012 (Republic Act No. 10173) and
            its Implementing Rules and Regulations.
          </p>
        </div>
      </div>
    </div>
  );
}; 