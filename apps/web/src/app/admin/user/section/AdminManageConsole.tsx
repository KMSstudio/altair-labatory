import { UserListByRole } from "./UserListByRole";
import { PromoteTo } from "./PromoteTo";
import { DemoteFrom } from "./DemoteFrom";
import { UserRole } from "@labatory/db";

export function AdminManageConsole (){
    return (
    <section>
      <h2>ADMIN 관리</h2>
        <UserListByRole userRole={UserRole.ADMIN}/>
        <PromoteTo promoteRole={UserRole.ADMIN}/>
        <DemoteFrom demoteRole={UserRole.ADMIN}/>
    </section>
  );
}
