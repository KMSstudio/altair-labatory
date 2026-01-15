import { UserListByRole } from "./UserListByRole";
import { PromoteTo } from "./PromoteTo";
import { DemoteFrom } from "./DemoteFrom";

export function AdminManageConsole (){
    return (
    <section>
      <h2>ADMIV 관리</h2>
        <UserListByRole Role="ADMIN"/>
        <PromoteTo promoteRole="ADMIN"/>
        <DemoteFrom demoteRole="ADMIN"/>
    </section>
  );
}

