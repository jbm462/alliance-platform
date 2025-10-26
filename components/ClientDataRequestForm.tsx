import { useState, useEffect } from 'react';
import { Copy, Mail, Check, ExternalLink } from 'lucide-react';

interface ClientDataRequestFormProps {
  instanceId: string;
  stepId: string;
  onRequestSent: (linkUrl: string) => void;
}

export default function ClientDataRequestForm({ 
  instanceId, 
  stepId, 
  onRequestSent 
}: ClientDataRequestFormProps) {
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [secureLink, setSecureLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Default message
  const defaultMessage = `Dear ${clientName || '[Client Name]'},

We're working on developing a service catalog for your organization. To ensure our analysis is accurate and tailored to your specific needs, we'd appreciate if you could upload relevant documentation through the secure link below.

Helpful documents include:
- Organization charts
- Process documentation
- Time studies or performance metrics
- Any existing service catalogs or process frameworks

The secure link will expire in 7 days.

Thank you for your assistance.`;

  // Set default message when client name changes
  useEffect(() => {
    setMessage(defaultMessage);
  }, [clientName, defaultMessage]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientEmail) {
      setError('Client email is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/workflow-instances/${instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stepId,
          stepType: 'client_validate',
          clientEmail,
          clientName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create client validation request');
      }
      
      const data = await response.json();
      
      setSecureLink(data.secureLink);
      onRequestSent(data.secureLink);
    } catch (error) {
      console.error('Error creating client validation request:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      },
      () => {
        setError('Failed to copy to clipboard');
      }
    );
  };
  
  const copyEmailContent = () => {
    const emailContent = `
Subject: Request for Process Documentation - Secure Upload Link

${message}

Secure Upload Link: ${secureLink}
    `;
    
    navigator.clipboard.writeText(emailContent).then(
      () => {
        alert('Email content copied to clipboard. You can now paste it into your email client.');
      },
      () => {
        setError('Failed to copy email content to clipboard');
      }
    );
  };
  
  return (
    <div className="space-y-6">
      {!secureLink ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human sm:text-sm"
            />
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50"
          >
            {isSubmitting ? 'Generating Link...' : 'Generate Secure Link'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Secure link generated successfully
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Secure Link for Client</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={secureLink}
                readOnly
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(secureLink)}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-4">
            <a
              href={secureLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Test Link
            </a>
            
            <button
              type="button"
              onClick={copyEmailContent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human"
            >
              <Mail className="mr-2 h-4 w-4" />
              Copy Email Content
            </button>
          </div>
          
          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Share this secure link with your client. They will be able to upload files without needing to create an account.
              The link will expire in 7 days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 