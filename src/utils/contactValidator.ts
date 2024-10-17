const validateContact = (contact: string) => contact.match(/^[6-9]\d{9}$/);
   
export default validateContact;