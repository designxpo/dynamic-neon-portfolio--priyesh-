import React, { useState } from 'react';
import { ContactData } from '../types';
import Section from './Section';
import { EmailIcon, PhoneIcon } from './icons/Icons';

interface ContactProps {
  data: ContactData;
}

const Contact: React.FC<ContactProps> = ({ data }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+1',
    contactNumber: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const countryCodes = [
    { code: '+1', country: 'US/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+39', country: 'Italy' },
    { code: '+7', country: 'Russia' },
    { code: '+55', country: 'Brazil' },
    { code: '+61', country: 'Australia' },
    { code: '+27', country: 'South Africa' },
    { code: '+971', country: 'UAE' },
    { code: '+65', country: 'Singapore' },
    { code: '+82', country: 'South Korea' },
    { code: '+66', country: 'Thailand' },
    { code: '+60', country: 'Malaysia' },
    { code: '+63', country: 'Philippines' },
    { code: '+84', country: 'Vietnam' },
    { code: '+62', country: 'Indonesia' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contactNumber: `${formData.countryCode} ${formData.contactNumber}`
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', countryCode: '+1', contactNumber: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section title="Get In Touch" id="contact">
        <div className="max-w-4xl xl:max-w-6xl mx-auto text-center">
             <h3 className="text-xl md:text-2xl xl:text-3xl font-bold mb-4">{data.heading}</h3>
             <p className="text-base md:text-lg text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto">{data.description}</p>

             {/* Contact Form */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 mb-8 md:mb-12 max-w-2xl mx-auto">
                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <input
                                 type="text"
                                 id="name"
                                 name="name"
                                 value={formData.name}
                                 onChange={handleInputChange}
                                 required
                                 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-colors"
                                 placeholder="Name"
                             />
                         </div>
                         <div>
                             <input
                                 type="email"
                                 id="email"
                                 name="email"
                                 value={formData.email}
                                 onChange={handleInputChange}
                                 required
                                 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-colors"
                                 placeholder="Email"
                             />
                         </div>
                     </div>
                     <div>
                         <div className="flex gap-3">
                             <select
                                 id="countryCode"
                                 name="countryCode"
                                 value={formData.countryCode}
                                 onChange={handleInputChange}
                                 className="px-3 py-3 bg-transparent border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-colors min-w-[100px]"
                             >
                                 {countryCodes.map(country => (
                                     <option key={country.code} value={country.code} className="bg-gray-800">
                                         {country.code}
                                     </option>
                                 ))}
                             </select>
                             <input
                                 type="tel"
                                 id="contactNumber"
                                 name="contactNumber"
                                 value={formData.contactNumber}
                                 onChange={handleInputChange}
                                 required
                                 className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-colors"
                                 placeholder="Phone Number"
                             />
                         </div>
                     </div>
                     <div>
                         <textarea
                             id="message"
                             name="message"
                             value={formData.message}
                             onChange={handleInputChange}
                             required
                             rows={4}
                             className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-colors resize-none"
                             placeholder="Tell me about your project or how we can work together... *"
                         />
                     </div>
                     <div className="pt-4">
                         <button
                             type="submit"
                             disabled={isSubmitting}
                             className="bg-brand-purple hover:bg-brand-purple-light text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-brand-purple/25"
                         >
                             {isSubmitting ? 'Sending...' : 'Send Message'}
                         </button>
                         {submitStatus === 'success' && (
                             <p className="text-green-400 mt-4 text-sm">Message sent successfully! I'll get back to you soon.</p>
                         )}
                         {submitStatus === 'error' && (
                             <p className="text-red-400 mt-4 text-sm">Failed to send message. Please try again.</p>
                         )}
                     </div>
                 </form>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                 <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 flex flex-col items-center">
                     <div className="p-3 md:p-4 bg-brand-purple/20 rounded-full mb-4 text-brand-purple-light">
                        <EmailIcon />
                     </div>
                     <h4 className="text-lg md:text-xl font-semibold mb-2">Email</h4>
                     <a href={`mailto:${data.email}`} className="text-sm md:text-base text-gray-300 hover:text-brand-purple transition-colors break-all">{data.email}</a>
                 </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 flex flex-col items-center">
                    <div className="p-3 md:p-4 bg-brand-purple/20 rounded-full mb-4 text-brand-purple-light">
                        <PhoneIcon />
                    </div>
                    <h4 className="text-lg md:text-xl font-semibold mb-2">Phone</h4>
                    <a href={`tel:${data.phone}`} className="text-sm md:text-base text-gray-300 hover:text-brand-purple transition-colors">{data.phone}</a>
                 </div>
             </div>

             <div className="flex justify-center gap-4 md:gap-6">
                 {data.socialLinks.map(link => (
                      <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-purple transform hover:scale-110 transition-all duration-300">
                          <span className="sr-only">{link.platform}</span>
                          {link.icon}
                      </a>
                  ))}
             </div>
        </div>
    </Section>
  );
};

export default Contact;
