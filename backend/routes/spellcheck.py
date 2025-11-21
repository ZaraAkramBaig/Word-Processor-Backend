from fastapi import APIRouter
import nltk
from nltk.corpus import words
from typing import List, Dict
import re

from models import SpellCheckRequest, SpellCheckResponse

router = APIRouter()

# Download required NLTK data (run once)
try:
    nltk.data.find('corpora/words')
except LookupError:
    nltk.download('words')

ENGLISH_WORDS = set(words.words())

@router.post("/check", response_model=SpellCheckResponse)
async def check_spelling(request: SpellCheckRequest):
    text = request.text
    
    word_pattern = re.compile(r'\b[a-zA-Z]+\b')
    found_words = word_pattern.findall(text)
    
    errors = []
    suggestions = {}
    
    # Calculate page breaks based on your editor's logic
    page_break_indices = []
    PAGE_MARKER = "<div class=\"page-divider\""
    idx = 0
    while True:
        idx = text.find(PAGE_MARKER, idx)
        if idx == -1:
            break
        page_break_indices.append(idx)
        idx += len(PAGE_MARKER)
    
    def calc_page_num(pos):
        # If you use page dividers, count how many break markers before pos
        page = 1
        for break_idx in page_break_indices:
            if pos > break_idx:
                page += 1
            else:
                break
        return page

    for i, word in enumerate(found_words):
        word_lower = word.lower()
        if word_lower not in ENGLISH_WORDS and len(word) > 1:
            position = text.find(word)
            errors.append({
                "word": word,
                "position": position,
                "length": len(word),
                "index": i,
                "page": calc_page_num(position), # page number
            })
            suggestions[word] = get_suggestions(word_lower)
    
    return SpellCheckResponse(errors=errors, suggestions=suggestions)


def get_suggestions(word: str, max_suggestions: int = 5) -> List[str]:
    """Generate spelling suggestions"""
    suggestions = []
    
    # Simple suggestion algorithm - find words that start with same letter
    for dict_word in list(ENGLISH_WORDS)[:1000]:  # Limit for performance
        if dict_word[0] == word[0] and len(dict_word) == len(word):
            # Calculate simple similarity
            diff = sum(1 for a, b in zip(word, dict_word) if a != b)
            if diff <= 2:  # Allow up to 2 character differences
                suggestions.append(dict_word)
                if len(suggestions) >= max_suggestions:
                    break
    
    return suggestions[:max_suggestions]

@router.post("/grammar")
async def check_grammar(request: SpellCheckRequest):
    """Basic grammar checking (FR-3)"""
    text = request.text
    errors = []
    
    # Simple grammar rules
    sentences = text.split('.')
    
    for i, sentence in enumerate(sentences):
        sentence = sentence.strip()
        if sentence:
            # Check if sentence starts with capital letter
            if sentence and not sentence[0].isupper():
                errors.append({
                    "type": "capitalization",
                    "message": "Sentence should start with a capital letter",
                    "position": text.find(sentence),
                    "sentence_index": i
                })
            
            # Check for double spaces
            if '  ' in sentence:
                errors.append({
                    "type": "spacing",
                    "message": "Multiple spaces detected",
                    "position": text.find('  '),
                    "sentence_index": i
                })
    
    return {"errors": errors}
