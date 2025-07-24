public class test2 {
    public static void main(String[] args) {
        Student student = new Student();
        Student.Address address = new Student.Address();
        address.setCity("beijing");
        address.setStreet("beijing");
        student.setAddress(address);
        student.setName("lisi");
        student.setAge(23);
        System.out.println(student);
    }
}
