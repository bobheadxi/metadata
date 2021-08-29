export class JSONLDData {
  private data: any[];
  constructor(data: any[]) {
    this.data = data;
  }
  get(property: string) {
    let value;
    this.data.find((item) => {
      if (!item) return;
      value = property
        .split('.')
        .reduce((o, i) => (o ? o[i] : undefined), item);
      return !!value || value === 0 || value === true;
    });
    return value;
  }
}

export function maybeJSONLD(doc: Document): JSONLDData | null {
  const jsonldData = Array.from(
    doc.querySelectorAll('script[type="application/ld+json"]')
  )
    .map((element) => {
      try {
        return JSON.parse(element.textContent);
      } catch (err) {
        return undefined;
      }
    })
    .filter((json) => json);
  if (!jsonldData) return null;
  try {
    return new JSONLDData(jsonldData);
  } catch (err) {
    return null;
  }
}
