import {
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    ChatBubbleLeftRightIcon,
  } from "@heroicons/react/24/outline";
  
  export const CONTACT_INFO_CARDS = [
    {
      title: "Email",
      text: "almadistrandröplabda@gmail.com",
      Icon: EnvelopeIcon,
    },
    {
      title: "Telefon",
      text: "+36 70 280 3145",
      Icon: PhoneIcon,
    },
    {
      title: "Helyszín",
      text: "8220 Balatonalmádi, Szilva köz 3 1/1",
      Icon: MapPinIcon,
    },
    {
      title: "Segítünk eligazodni",
      text: "Írj nekünk bátran, és segítünk megtalálni a neked való lehetőséget.",
      Icon: ChatBubbleLeftRightIcon,
    },
  ];
  
  export const INITIAL_CONTACT_FORM_DATA = {
    name: "",
    email: "",
    phone: "",
    message: "",
    accepted: false,
  };