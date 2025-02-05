const validateContact = (contact: string): boolean => /^[6-9]\d{9}$/.test(contact);
   
export default validateContact;
