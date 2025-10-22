import React, { useState, useEffect } from 'react';
import Section from '../Section';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  message: string;
  submittedAt: string;
}

const ContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      setError('Error fetching submissions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Section title="Contact Submissions" id="admin-contacts">
        <div className="text-center text-gray-400">Loading submissions...</div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="Contact Submissions" id="admin-contacts">
        <div className="text-center text-red-400">{error}</div>
      </Section>
    );
  }

  return (
    <Section title="Contact Submissions" id="admin-contacts">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Total Submissions: {submissions.length}</h3>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No contact submissions yet.
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-lg text-white">{submission.name}</h4>
                    <p className="text-gray-300">{submission.email}</p>
                    <p className="text-gray-300">{submission.contactNumber}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    {formatDate(submission.submittedAt)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap">{submission.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

export default ContactSubmissions;
