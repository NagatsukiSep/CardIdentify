export const ExpansionAlias = ( expansionText: string ) => {
  return expansionText;
}

export function CollectionAlias( collectionText: string ): string {
  const pattern = /(\d{3})\s*\/\s*(\d{3})\s*(C|U|R|RR|SR|UR|AR|SAR)/g;

  const cleanedText = collectionText.replace(/[^\d\/CURSR]/g, '');

  const correctedText = cleanedText.replace(pattern, (match, p1, p2, p3) => {
    return `${p1} / ${p2} ${p3}`;
  });

  return correctedText;
}

