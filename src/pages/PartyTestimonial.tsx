import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  event: string;
  rating: number;
  comment: string;
}

const testimonials: Testimonial[] = [
  { name: "Adebayo O.", event: "Birthday Party", rating: 5, comment: "Food was amazing! Everyone loved it." },
  { name: "Chidinma K.", event: "Wedding", rating: 5, comment: "Professional service, delicious food." },
  { name: "Emeka N.", event: "Corporate Event", rating: 5, comment: "Highly recommended for events." },
  { name: "Folake A.", event: "Baby Shower", rating: 5, comment: "They made my day special!" },
];

const PartyTestimonial = () => {
  return (
    <div>
      <h3 className="text-md font-bold text-gray-800 mb-3">⭐ Happy Party Hosts</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {testimonials.map((testimonial, i) => (
          <div key={i} className="min-w-[200px] bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-0.5 mb-1">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-gray-600 mb-2">"{testimonial.comment}"</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-800">{testimonial.name}</span>
              <span className="text-[10px] text-gray-400">{testimonial.event}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyTestimonial;