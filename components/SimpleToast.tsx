type SimpleToastProps = {
  message: string;
  type?: "success" | "error";
};

export default function SimpleToast({
  message,
  type = "success",
}: SimpleToastProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
        type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}