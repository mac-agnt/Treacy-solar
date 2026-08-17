import { notFound } from "next/navigation";
import { PROPERTIES, getProperty } from "@/lib/data/properties";
import { PropertyDetail } from "@/components/modules/properties/PropertyDetail";

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getProperty(id)) notFound();
  return <PropertyDetail id={id} />;
}
