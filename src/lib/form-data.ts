export function formDataFields(formData: FormData): Record<string, FormDataEntryValue> {
  const fields: Record<string, FormDataEntryValue> = {};
  formData.forEach((value, key) => {
    fields[key] = value;
  });
  return fields;
}
