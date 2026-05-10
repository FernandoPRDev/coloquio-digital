import { ReactNode } from "react";

type ButtonProps = {
    children: ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
};

export function PrimaryButton({
    children,
    type = "button",
    onClick,
    disabled = false,
    className = "",
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-xl bg-[#2e5090] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400 ${className}`}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({
    children,
    type = "button",
    onClick,
    disabled = false,
    className = "",
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}

type CardProps = {
    children: ReactNode;
    className?: string;
};

export function SectionCard({ children, className = "" }: CardProps) {
    return (
        <section
            className={`rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm ${className}`}
        >
            {children}
        </section>
    );
}

type FieldProps = {
    label: string;
    children: ReactNode;
    helpText?: string;
};

export function FormField({ label, children, helpText }: FieldProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-800">
                {label}
            </label>
            {children}
            {helpText && <p className="mt-2 text-xs text-zinc-500">{helpText}</p>}
        </div>
    );
}

export const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#2e5090] focus:ring-2 focus:ring-[#2e5090]/20";

export function PageHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-8">
            {eyebrow && (
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#2e5090]">
                    {eyebrow}
                </p>
            )}

            <h1 className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                {title}
            </h1>

            {description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 md:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}

export function StatusBadge({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: "neutral" | "success" | "warning" | "danger" | "blue";
}) {
    const tones = {
        neutral: "border-zinc-200 bg-zinc-50 text-zinc-700",
        success: "border-green-200 bg-green-50 text-green-700",
        warning: "border-orange-200 bg-orange-50 text-orange-700",
        danger: "border-red-200 bg-red-50 text-red-700",
        blue: "border-blue-200 bg-blue-50 text-blue-700",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
        >
            {children}
        </span>
    );
}