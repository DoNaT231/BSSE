import { useEffect, useState } from "react";
import { emptyUserForm } from "../utils/userInitialState";
import { mapUserToForm } from "../utils/userFormatters";

export default function useUserEditor(selectedUser) {
  const [formData, setFormData] = useState(emptyUserForm);

  useEffect(() => {
    if (!selectedUser) {
      setFormData(emptyUserForm);
      return;
    }

    setFormData(mapUserToForm(selectedUser));
  }, [selectedUser]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setFormData(mapUserToForm(selectedUser));
  }

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
  };
}