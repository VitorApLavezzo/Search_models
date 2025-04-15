from pydantic import BaseModel
from typing import Dict, List, Any, Tuple

class Node:
    def __init__(self, id: str, value: str, neighbors: Dict[str, float]):
        self.id = id
        self.value = value
        self.neighbors = neighbors

class SearchStep(BaseModel):
    current_node: str
    frontier: List[Tuple[float, List[str]]]  # [(custo, caminho)]
    explored: List[str]
    current_path: List[str]
    current_cost: float

class SearchRequest(BaseModel):
    graph: Dict[str, Dict[str, Any]]
    startNode: str
    goalNodes: List[str]

class SearchResult(BaseModel):
    path: List[Dict[str, str]]
    cost: float
    steps: List[SearchStep]

class SearchResponse(BaseModel):
    results: List[SearchResult] 