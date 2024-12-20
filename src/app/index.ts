import initDB from "../database/dbinit";
import Users from "../database/tables/usersTable";
import init from "./app";

const server = async () => {
 try {
  await initDB();
  Users.destroy({where: {email: "vaibhavk1965@gmail.com"}})
  init();
 } catch (error: any) {
  console.log("SOME ERROR OCCURRED", error?.message);
 };
};

server();
