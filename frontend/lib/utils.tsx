import { Star } from "lucide-react";

const hireBadgeColors: Record<string, string> = {
  "Strong Yes": "bg-green-100 text-green-800",
  Yes: "bg-green-50 text-green-700",
  Maybe: "bg-yellow-100 text-yellow-800",
  No: "bg-orange-50 text-orange-700",
  "Strong No": "bg-red-100 text-red-800",
  "Not mentioned": "bg-gray-100 text-gray-800",
};

const renderStars = (rating: number | null | undefined): React.ReactNode => {
  if (!rating || rating < 1 || rating > 5) {
    return <span className="text-gray-400">No rating</span>;
  }

  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
};

const renderSalary = (
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined,
): string => {
  if (!min || !max) return "Not mentioned";

  const c = currency || "USD";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 0,
  });

  return `${formatter.format(min)} — ${formatter.format(max)} / year`;
};

export { hireBadgeColors, renderStars, renderSalary };
