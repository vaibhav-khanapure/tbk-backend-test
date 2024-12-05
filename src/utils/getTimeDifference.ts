import moment from "moment";

const getTimeDifference = (arrivalTime: any,DepartureTime: any) => {
 const dateTime1 = moment(arrivalTime);
 const dateTime2 = moment(DepartureTime);
  
 const diffInMilliseconds = dateTime1.diff(dateTime2);
 const duration = moment.duration(diffInMilliseconds);

 const days = Math.floor(duration.asDays());
 const hours = duration.hours();
 const minutes = duration.minutes();

 const diffArray: string[] = [];
 if(days > 0) diffArray.push(`${days} d${days !== 1 ? 's' : ''}`);
 if(hours > 0) diffArray.push(`${hours} h${hours !== 1 ? 's' : ''}`);
 if(minutes > 0) diffArray.push(`${minutes} m${minutes !== 1 ? 's' : ''}`);
  
 const formattedDiff = diffArray.join(' ');
 return formattedDiff;
};

export default getTimeDifference