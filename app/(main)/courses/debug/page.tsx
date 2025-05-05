import { getAllCourses } from "@/lib/courses";

export default async function CourseDebugPage() {
  const courses = await getAllCourses();
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Course Debug Information</h1>
      <p className="mb-4">Total courses: {courses.length}</p>
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Course IDs and Details</h2>
        <ul className="space-y-2 border rounded-md p-4">
          {courses.map((course) => (
            <li key={course.id} className="border-b pb-2">
              <div><strong>ID:</strong> <code className="bg-gray-100 px-1 rounded">{course.id}</code> (type: {typeof course.id})</div>
              <div><strong>Name:</strong> {course.name}</div>
              <div><strong>Location:</strong> {course.location}</div>
              <div><strong>Direct Link:</strong> <a href={`/courses/${course.id}`} className="text-blue-600 underline">/courses/{course.id}</a></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 