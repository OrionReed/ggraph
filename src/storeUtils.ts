import { Editor, RecordId, TLDocument } from "tldraw";

const docId = 'document:document' as RecordId<TLDocument>

export function setDocumentMeta(editor: Editor, meta: Record<string, any>) {
  const updateFunc = (doc: TLDocument) => {
    return {
      ...doc,
      meta: {
        ...doc.meta,
        ...meta
      }
    }
  }
  editor.store.update(docId, updateFunc)
}
export function getDocumentMeta(editor: Editor) {
	const document = editor.store.get(docId)
  if (!document) return
  return document.meta
}
export function removeDocumentMeta(editor: Editor, key: string) {
  const updateFunc = (doc: TLDocument) => {
    const { [key]: _, ...restMeta } = doc.meta;
    return {
      ...doc,
      meta: restMeta
    };
  };
  editor.store.update(docId, updateFunc);
}
export function getUserId(editor: Editor) {
  return editor.user.getId()
}
export function setUserPreferences(editor: Editor, name: string, color: string) {
  editor.user.updateUserPreferences({
    name,
    color
  })
}
export function getUsersInRoom(editor: Editor) {
  return editor.getCollaborators().map(c=> c.userId)
}