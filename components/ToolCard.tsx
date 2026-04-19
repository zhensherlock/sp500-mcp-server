"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ToolCardProps {
  name: string;
  description: string;
  params: Param[];
  returns: string;
}

export default function ToolCard({
  name,
  description,
  params,
  returns,
}: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`tool-card ${isOpen ? "open" : ""}`}>
      <button
        className="tool-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`tool-content-${name}`}
      >
        <div>
          <div className="tool-title-row">
            <span className="tool-name">{name}</span>
            <span className="tool-badge">Tool</span>
          </div>
          <p className="tool-description">{description}</p>
        </div>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className="tool-chevron"
          aria-hidden="true"
        />
      </button>
      <div className="tool-content" id={`tool-content-${name}`} role="region">
        <div className="tool-content-inner">
          <div className="tool-body">
            <h4 className="tool-section-title">Parameters</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {params.map((param) => (
                  <tr key={param.name}>
                    <td>
                      <span className="param-name">{param.name}</span>
                      {param.required ? (
                        <span className="param-required">required</span>
                      ) : (
                        <span className="param-optional">optional</span>
                      )}
                    </td>
                    <td>
                      <span className="param-type">{param.type}</span>
                    </td>
                    <td>
                      <span className="param-desc">{param.description}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 className="tool-section-title">Returns</h4>
            <div className="return-block">
              <pre className="return-code">{returns}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}