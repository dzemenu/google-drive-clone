export interface Files {
  size: string;
  id: number;
  name: string;
  url: string;
}
export interface FileItem {
  size: string;
  id: number;
  name: string;
  type: string;
  files?: Files[];
}
export const mockData: FileItem[] = [
  {
    id: 1,
    name: "Project Files",
    type: "folder",
    files: [
      {
        id: 11,
        name: "proposal.docx",
        url: "#",
        size: "",
      },
      {
        id: 12,
        name: "budget.xlsx",
        url: "#",
        size: "",
      },
    ],
    size: "",
  },
  {
    id: 2,
    name: "Photos",
    type: "folder",
    files: [
      {
        id: 21,
        name: "team.jpg",
        url: "#",
        size: "",
      },
      {
        id: 22,
        name: "event.png",
        url: "#",
        size: "",
      },
    ],
    size: "",
  },
  {
    id: 3,
    name: "resume.pdf",
    type: "file",
    size: "",
  },
];
