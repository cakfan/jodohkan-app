export function buildPartnerCriteriaDescription(
  partnerCity?: string | null,
  partnerAgeMin?: number | null,
  partnerAgeMax?: number | null,
  partnerCriteria?: string | null,
  partnerOccupation?: string | null,
): string | null {
  if (
    !partnerCity &&
    !partnerAgeMin &&
    !partnerAgeMax &&
    !partnerCriteria &&
    !partnerOccupation
  ) {
    return null;
  }

  const parts: string[] = [];

  if (partnerCity) {
    parts.push(`Domisili: ${partnerCity}`);
  }

  if (partnerAgeMin && partnerAgeMax) {
    parts.push(`Usia: ${partnerAgeMin}-${partnerAgeMax} tahun`);
  } else if (partnerAgeMin) {
    parts.push(`Usia min: ${partnerAgeMin} tahun`);
  } else if (partnerAgeMax) {
    parts.push(`Usia max: ${partnerAgeMax} tahun`);
  }

  if (partnerCriteria) {
    parts.push(`Pendidikan: ${partnerCriteria}`);
  }

  if (partnerOccupation) {
    parts.push(`Pekerjaan: ${partnerOccupation}`);
  }

  return parts.join(" | ");
}
