import React, { useState, useEffect } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import axios from "axios";
import { useStateContext } from "../context/ContextProvider";

const TestimonialsSection = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user and token from context
  const { user, token } = useStateContext();

  // Fetch recent testimonials from different users
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get("http://localhost:3000/commentaire/diff-commentaire");
        setTestimonials(response.data);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    };
    fetchTestimonials();
  }, []);

  // Map rating to SatisfactionLevel
  const mapRatingToSatisfaction = (rating) => {
    if (rating === 5) return "tres_satisfait";
    if (rating >= 3) return "satisfait";
    return "pas_satisfait";
  };

  // Map SatisfactionLevel to star count for display
  const mapSatisfactionToStars = (satisfaction) => {
    switch (satisfaction) {
      case "tres_satisfait":
        return 5;
      case "satisfait":
        return 3;
      case "pas_satisfait":
        return 1;
      default:
        return 3; // Default to satisfait
    }
  };

  // Map SatisfactionLevel to display text
  const satisfactionDisplay = {
    tres_satisfait: "Excellent",
    satisfait: "Bien",
    pas_satisfait: "Décevant",
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim().length < 10 || !user || !token) {
      setError("Veuillez vous connecter et compléter tous les champs requis.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/commentaire",
        {
          contenu: comment.trim(),
          satisfaction: mapRatingToSatisfaction(rating),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Témoignage publié avec succès !");
      setComment("");
      setRating(0);
      setHoverRating(0);

      // Refresh testimonials
      const updatedTestimonials = await axios.get("http://localhost:3000/commentaire/diff-commentaire");
      setTestimonials(updatedTestimonials.data);
    } catch (err) {
      setError("Erreur lors de la publication du témoignage. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star ratings
  const renderStars = (currentRating, interactive = false) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        className={`${interactive ? "cursor-pointer" : ""} transition-all duration-300 transform ${
          index < (interactive ? hoverRating || rating : currentRating)
            ? "text-yellow-400 scale-110 drop-shadow-lg"
            : "text-gray-300"
        } ${interactive && index < (hoverRating || rating) ? "hover:scale-125" : ""}`}
        size={interactive ? 32 : 20}
      />
    ));
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40 py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/15 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-l from-indigo-300/20 to-purple-300/15 rounded-full blur-2xl animate-pulse delay-1000" />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 mb-6">
            Partagez Votre Expérience
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Votre avis compte énormément pour nous. Aidez d'autres utilisateurs en partageant votre expérience.
          </p>
        </div>

        {/* Form */}
        {user ? (
          <div className="mb-20">
            <form
              onSubmit={handleSubmit}
              className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 rounded-3xl p-10 border border-white/20 hover:shadow-3xl hover:shadow-purple-500/15 transition-all duration-500"
            >
              {/* Rating Section */}
              <div className="text-center mb-8">
                <label className="block text-2xl font-bold text-gray-800 mb-6">
                  Évaluez votre expérience
                </label>
                <div className="flex justify-center gap-2 mb-4">
                  {renderStars(rating, true)}
                </div>
                <p className="text-sm text-gray-500">
                  {rating > 0 && (
                    <span className="text-gradient bg-gradient-to-r from-[#6B46C1] to-indigo-600 bg-clip-text text-transparent font-semibold">
                      {rating === 1 ? "Décevant" : rating === 2 ? "Moyen" : rating === 3 ? "Bien" : rating === 4 ? "Très bien" : "Excellent"}
                    </span>
                  )}
                </p>
              </div>

              {/* Comment Section */}
              <div className="relative mb-8">
                <label className="block text-xl font-bold text-gray-800 mb-4">
                  Votre témoignage
                </label>
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience en détail... Qu'est-ce qui vous a le plus marqué ?"
                    className="w-full h-32 p-6 border-2 border-gray-200 rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 resize-none text-gray-700 placeholder-gray-400 bg-gradient-to-br from-white to-gray-50/50"
                    required
                    minLength={10}
                    maxLength={500}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {comment.length}/500
                  </div>
                </div>
              </div>

              {/* Feedback Messages */}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
                  className="group relative bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-xl tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <FaQuoteLeft className="text-lg" />
                    Publier mon témoignage
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-20 text-center">
            <p className="text-lg text-gray-600">
              Veuillez vous <a href="/login" className="text-indigo-600 hover:underline">connecter</a> pour laisser un témoignage.
            </p>
          </div>
        )}

        {/* Testimonials Display */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100"
            >
              <div className="flex items-center mb-4">
                {testimonial.userPhoto ? (
                  <img
                    src={testimonial.userPhoto}
                    alt={testimonial.userName || "Utilisateur"}
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg font-bold">
                      {testimonial.userName?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-slate-800">
                    {testimonial.userName || "Anonyme"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {satisfactionDisplay[testimonial.satisfaction] || "Bien"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {renderStars(mapSatisfactionToStars(testimonial.satisfaction))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {testimonial.contenu}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(testimonial.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;