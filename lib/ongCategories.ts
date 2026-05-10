export type OngCategoryKey = "ambiental" | "desarrollo" | "derechos-humanos";

export const ONG_CATEGORY_STYLES: Record<
    OngCategoryKey,
    {
        label: string;
        color: string;
        bg: string;
        border: string;
        text: string;
    }
> = {
    ambiental: {
        label: "Ambiental",
        color: "#009e51",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
    },
    desarrollo: {
        label: "Desarrollo",
        color: "#f88f03",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
    },
    "derechos-humanos": {
        label: "Derechos humanos",
        color: "#2e5090",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
    },
};

export function getOngCategoryStyle(category?: string | null) {
    if (
        category === "ambiental" ||
        category === "desarrollo" ||
        category === "derechos-humanos"
    ) {
        return ONG_CATEGORY_STYLES[category];
    }

    return {
        label: category || "Sin categoría",
        color: "#52525b",
        bg: "bg-zinc-50",
        border: "border-zinc-200",
        text: "text-zinc-700",
    };
}