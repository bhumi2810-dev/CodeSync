import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({
  language,
  value,
  onChange,
}: CodeEditorProps) => {

  const handleEditorChange = (
    newValue: string | undefined
  ) => {
    onChange(newValue ?? "");
  };

  return (
    <div className="h-full w-full">

      <Editor
        height="100%"
        width="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"

        options={{
          fontSize: 15,
          minimap: {
            enabled: false,
          },

          automaticLayout: true,

          padding: {
            top: 20,
            bottom: 20,
          },

          scrollBeyondLastLine: false,

          lineNumbers: "on",

          roundedSelection: false,

          cursorBlinking: "smooth",

          smoothScrolling: true,

          wordWrap: "on",

          tabSize: 4,

          suggestOnTriggerCharacters: true,
        }}
      />

    </div>
  );
};

export default CodeEditor;