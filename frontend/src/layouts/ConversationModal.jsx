// ConversationModal.jsx
import { X, Minus, Maximize, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ConversationModal = ({ show, onClose, conversation, darkMode }) => {
    const [emailData, setEmailData] = useState({
        subject: '',
        message: '',
    });
    const [showDetails, setShowDetails] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);

    const handleChange = (e) => {
        setEmailData({ ...emailData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setAttachedFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setAttachedFile(null);
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();

        if (!emailData.message) {
            toast.warning('⚠️ Veuillez écrire un message avant d\'envoyer.');
            return;
        }

        const formData = new FormData();
        formData.append('to', conversation?.content?.email || '');
        formData.append('name', `${conversation?.content?.firstName || ''} ${conversation?.content?.lastName || ''}`);
        formData.append('message', emailData.message);
        formData.append('subject', emailData.subject || 'Réponse à votre message');
        if (attachedFile) {
            formData.append('attachment', attachedFile);
        }

        console.log('Envoi des données au backend:', formData); // Debug

        try {
            const res = await fetch('http://localhost:3000/contact_messages/send-email', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`✅ E-mail envoyé avec succès à ${conversation.content.email}`);
                setEmailData({ subject: '', message: '' });
                setAttachedFile(null);
                onClose();
            } else {
                toast.error(`❌ Erreur: ${data.message || 'Erreur lors de l\'envoi de l\'e-mail.'}`);
            }
        } catch (err) {
            console.error('Erreur envoi e-mail:', err);
            toast.error('❌ Impossible d’envoyer l’e-mail (erreur réseau ou serveur).');
        }
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 right-4 z-[101] flex items-end justify-end p-4">
            <div
                className={`rounded-t-lg shadow-[0_1px_8px_rgba(0,0,0,0.2)] transition-all duration-300
                ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}
                ${maximized ? 'w-[75vw] h-[75vh]' : 'w-full max-w-[1000px]'}
                ${minimized ? 'h-[100px] overflow-hidden' : 'h-auto'} 
                flex flex-col font-sans text-sm`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-4 py-2 border-b ${
                        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
                    }`}
                >
                    <h2 className={`font-normal text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Nouveau message
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setMinimized(!minimized)}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        >
                            <Minus className={darkMode ? 'w-4 h-4 text-gray-200' : 'w-4 h-4 text-gray-600'} />
                        </button>
                        <button
                            onClick={() => setMaximized(!maximized)}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        >
                            <Maximize className={darkMode ? 'w-4 h-4 text-gray-200' : 'w-4 h-4 text-gray-600'} />
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        >
                            <X className={darkMode ? 'w-4 h-4 text-gray-200' : 'w-4 h-4 text-gray-600'} />
                        </button>
                    </div>
                </div>

                {/* Previous Message Info */}
                {!minimized && conversation?.content && (
                    <div
                        className={`px-4 py-2 border-b ${
                            darkMode
                                ? 'border-gray-700 bg-gray-700 text-gray-300'
                                : 'border-gray-200 bg-gray-50 text-gray-600'
                        } text-xs`}
                    >
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setShowDetails((prev) => !prev)}
                        >
                            <p className="font-medium">Message précédent</p>
                            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>

                        {showDetails && (
                            <div className="mt-2 space-y-1">
                                <p className="italic">{conversation.content.message}</p>
                                <p>
                                    <span className="font-medium">De:</span>{' '}
                                    {conversation.content.firstName} {conversation.content.lastName}
                                </p>
                                <p>
                                    <span className="font-medium">E-mail:</span> {conversation.content.email}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Email Form */}
                {!minimized && (
                    <form onSubmit={handleSendEmail} className="flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col px-4 py-2 space-y-2">
                            <div>
                                <input
                                    disabled
                                    type="email"
                                    value={conversation?.content?.email || ''}
                                    className={`w-full px-2 py-1 border-b ${
                                        darkMode
                                            ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none text-sm`}
                                    placeholder="À"
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="subject"
                                    value={emailData.subject}
                                    onChange={handleChange}
                                    className={`w-full px-2 py-1 border-b ${
                                        darkMode
                                            ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none text-sm`}
                                    placeholder="Sujet"
                                />
                            </div>

                            <div className="flex-1">
                                <textarea
                                    name="message"
                                    rows="8"
                                    value={emailData.message}
                                    onChange={handleChange}
                                    className={`w-full h-full px-2 py-2 border-none resize-none ${
                                        darkMode
                                            ? 'bg-gray-800 text-gray-200 placeholder-gray-400'
                                            : 'bg-white text-gray-900 placeholder-gray-500'
                                    } focus:outline-none text-sm font-sans leading-relaxed`}
                                    placeholder="Rédiger votre e-mail"
                                    required
                                />
                            </div>

                            {/* Warning Info */}
                            <div
                                className={`mx-4 my-2 p-2 rounded text-xs ${
                                    darkMode
                                        ? 'bg-yellow-800 text-yellow-100'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                ⚠️ Vérifiez votre dossier spam ! Les e-mails envoyés depuis ce serveur local peuvent arriver dans le spam.
                            </div>

                            {/* File Upload */}
                            {attachedFile && (
                                <div className="text-xs text-green-600 dark:text-green-400">
                                    📎 Fichier sélectionné : {attachedFile.name}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            className={`flex items-center justify-between px-4 py-3 border-t ${
                                darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                        >
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-5 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                                <FaPaperPlane className="w-3.5 h-3.5" />
                                Envoyer
                            </button>

                            <div className="flex items-center gap-2">
                                <label
                                    className={`cursor-pointer text-xs ${
                                        darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Joindre un fichier
                                    <input type="file" onChange={handleFileChange} className="hidden" />
                                </label>

                                {attachedFile && (
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className="truncate max-w-[120px]">{attachedFile.name}</span>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ConversationModal;