const travelClass = [
    {
        id: 1,
        label: "Economy/Premium Economy",
    },
    {
        id: 2,
        label: "Economy",
    },
    {
        id: 3,
        label: "Premium Economy",
    },
    {
        id: 4,
        label: "Business",
    },
    {
        id: 5,
        label: "Premium Business",
    },
    {
        id: 6,
        label: "First Class",
    },
];

const getCabinClass = (id: number) => {
 const travel = travelClass?.find(item => String(item?.id) === String(id));
 return travel?.label || "";
};

export default getCabinClass;