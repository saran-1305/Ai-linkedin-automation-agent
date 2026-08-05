import os

class PromptBuilder:
    def __init__(self):
        self.prompts_dir = os.path.dirname(__file__)
        self.system_prompt_path = os.path.join(self.prompts_dir, "prompts", "system_prompt.txt")
        self.analysis_prompt_path = os.path.join(self.prompts_dir, "prompts", "analysis_prompt.txt")
        self.json_schema_path = os.path.join(self.prompts_dir, "prompts", "json_schema.txt")

    def _read_file(self, path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def build_system_prompt(self) -> str:
        return self._read_file(self.system_prompt_path)

    def build_user_prompt(self, document_text: str, source: str, word_count: int, language: str) -> str:
        template = self._read_file(self.analysis_prompt_path)
        schema = self._read_file(self.json_schema_path)
        
        # Inject data
        prompt = template.replace("{source}", source)
        prompt = prompt.replace("{word_count}", str(word_count))
        prompt = prompt.replace("{language}", language)
        prompt = prompt.replace("{json_schema}", schema)
        prompt = prompt.replace("{document_text}", document_text)
        
        return prompt
