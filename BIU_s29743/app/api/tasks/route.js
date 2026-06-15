import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(tasksDB);
}



let tasksDB = [
    {
        id: 1,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 2,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 3,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 4,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 5,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 6,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 7,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 8,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 9,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 10,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 11,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 12,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 13,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 14,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 15,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 16,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 17,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 18,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 19,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 20,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 21,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 22,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 23,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 24,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 25,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 26,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 27,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 28,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 29,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 30,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 31,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 32,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 33,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 34,
        title: "Task1",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 35,
        title: "Task2",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    {
        id: 36,
        title: "Task333",
        priority: 0,
        tags: {
            main: "main tag",
            otherTags: ["other1", "other2", "other3"],
        },
        assignee : "test assignee",
        status: "done", group: "test",
        startDate: new Date("December 17, 1995 03:24:00"),
        dueDate: new Date("December 17, 1995 03:24:00"),
        repeat: {
            time: 3600000,
            next: new Date("December 17, 1995 03:24:00"),
        }
    },
    ]