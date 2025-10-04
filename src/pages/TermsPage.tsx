import React from 'react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8">
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="mb-3">
            Welcome to OJTech. These Terms of Service ("Terms") govern your access to and use of the 
            OJTech platform, including our website, services, and applications (collectively, the "Service").
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. 
            If you do not agree to these Terms, you may not access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Data Privacy and Security</h2>
          <p className="mb-3">
            OJTech is committed to protecting your data privacy rights in accordance with the Philippines' 
            Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.
          </p>
          <p className="mb-3">
            Our collection, use, and disclosure of your personal information is governed by our Privacy Policy, 
            which is incorporated into these Terms by reference. By using our Service, you consent to the 
            collection, use, and disclosure of your information as described in our Privacy Policy.
          </p>
          <p>
            As a user of OJTech, you have rights under the Data Privacy Act, including the right to be 
            informed, access, object, erasure or blocking, damages, data portability, and rectification. 
            For more information about these rights, please refer to our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts and Registration</h2>
          <p className="mb-3">
            To access certain features of the Service, you may need to register for an account. When 
            registering, you agree to provide accurate, current, and complete information and to update 
            this information to maintain its accuracy.
          </p>
          <p className="mb-3">
            You are responsible for maintaining the confidentiality of your account credentials and for all 
            activities that occur under your account. You agree to notify us immediately of any unauthorized 
            use of your account or any other breach of security.
          </p>
          <p>
            We reserve the right to suspend or terminate your account if we determine, in our sole discretion, 
            that you have violated these Terms or that your conduct may harm OJTech or others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
          <p className="mb-3">
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violating any applicable law, regulation, or these Terms</li>
            <li>Impersonating any person or entity, or falsely representing your affiliation with any person or entity</li>
            <li>Interfering with or disrupting the Service or servers or networks connected to the Service</li>
            <li>Submitting false or misleading information in your profile or job applications</li>
            <li>Using the Service for any fraudulent or illegal purpose</li>
            <li>Harassing, threatening, or intimidating any other user of the Service</li>
            <li>Collecting or harvesting any information from the Service, including user profiles and contact information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property Rights</h2>
          <p className="mb-3">
            The Service and its contents, features, and functionality are owned by OJTech and are protected by 
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly 
            perform, republish, download, store, or transmit any of the material on our Service, except as 
            permitted by these Terms or with our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. User Content</h2>
          <p className="mb-3">
            The Service allows you to upload, submit, store, send, or receive content ("User Content"). 
            You retain all intellectual property rights in your User Content, but you grant OJTech a 
            worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, 
            translate, and distribute your User Content in connection with providing the Service.
          </p>
          <p className="mb-3">
            You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You own or have the necessary rights to your User Content and the right to grant the license above</li>
            <li>Your User Content does not violate the privacy rights, publicity rights, intellectual property rights, or any other rights of any person or entity</li>
            <li>Your User Content does not contain any material that is defamatory, obscene, offensive, hateful, or otherwise objectionable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="mb-3">
            To the maximum extent permitted by law, OJTech and its officers, employees, agents, and partners 
            shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses 
            resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Dispute Resolution</h2>
          <p>
            Any dispute arising from or relating to these Terms or the Service shall be resolved in accordance 
            with the laws of the Republic of the Philippines, specifically including the Data Privacy Act of 2012 
            and other applicable laws. You agree to first try to resolve any dispute informally by contacting us. 
            If a dispute cannot be resolved informally, you and OJTech agree to submit to the exclusive jurisdiction 
            of the courts located in Manila, Philippines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes to These Terms</h2>
          <p>
            We may revise these Terms from time to time at our sole discretion. All changes are effective 
            immediately when we post them. Your continued use of the Service following the posting of revised 
            Terms means that you accept and agree to the changes. We encourage you to check this page periodically 
            for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
          <p className="mb-3">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mb-1"><strong>Email:</strong> ojtech.team@gmail.com</p>
          <p className="mb-1"><strong>Address:</strong> OJTech Office, Cebu, Philippines</p>
          <p><strong>Phone:</strong> +63 (2) 8XXX-XXXX</p>
        </section>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="italic text-gray-500 dark:text-gray-400 text-sm">
            These Terms of Service are compliant with the Philippines' Data Privacy Act of 2012 (Republic Act No. 10173)
            and other applicable Philippine laws and regulations.
          </p>
        </div>
      </div>
    </div>
  );
}; 