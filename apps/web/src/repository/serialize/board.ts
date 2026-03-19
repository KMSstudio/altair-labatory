import { BoardAclDbShape, BoardAclDTO, BoardDbShape, BoardDTO } from "../dto/board";

export function serializeBoardAcl(boardAcl: BoardAclDbShape): BoardAclDTO {
  return {
    id: boardAcl.id.toString(),
    boardId: boardAcl.boardId.toString(),
    action: boardAcl.action,
    role: boardAcl.role,
  };
}

export function serializeBoard(board: BoardDbShape): BoardDTO {
  return {
    id: board.id.toString(),
    nameKo: board.nameKo,
    nameEn: board.nameEn,
    description: board.description?.toString(),
    isActive: board.isActive,
    aclRules: board.aclRules.map(serializeBoardAcl),
    _count: {
      articles: board._count.articles,
    },
  };
}
