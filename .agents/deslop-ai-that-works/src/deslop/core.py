"""Core document deslopper logic."""

from baml_client import b


async def deslop_document(document: str, instructions: str | None = None) -> str:
    """Rewrite a document so it sounds less generic and AI-generated."""
    patterns = await b.IdentifyDocumentSlop(document=document, instructions=instructions)
    return await b.RewriteDocumentWithoutSlop(
        document=document, patterns=patterns, instructions=instructions
    )
