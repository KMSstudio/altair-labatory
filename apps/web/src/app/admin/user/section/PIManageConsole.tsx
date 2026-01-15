import { UserListByRole } from "./UserListByRole";
import { PromoteTo } from "./PromoteTo";
import { DemoteFrom } from "./DemoteFrom";
import { UserRole } from "@labatory/db";

export function PIManageConsole (){
    return (
    <section>
      <h2>PI 관리</h2>
        <UserListByRole Role={UserRole.PI}/>
        <PromoteTo promoteRole={UserRole.PI}/>
        <DemoteFrom demoteRole={UserRole.PI}/>
    </section>
  );
}
